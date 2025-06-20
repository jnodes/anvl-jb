from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta
import logging

from ..models import (
    Loan, LoanCreate, LoanUpdate, LoansResponse,
    LoanStatus, Transaction, TransactionCreate, TransactionType
)
from ..database import (
    loans_collection, dealers_collection, transactions_collection,
    find_one_and_convert, find_many_and_convert
)

router = APIRouter(prefix="/loans", tags=["loans"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=LoansResponse)
async def create_loan(loan_data: LoanCreate):
    """Create a new loan application"""
    try:
        # Verify dealer exists
        dealer = await find_one_and_convert(dealers_collection, {"id": loan_data.dealer_id})
        if not dealer:
            raise HTTPException(status_code=404, detail="Dealer not found")
        
        # Create loan
        new_loan = Loan(**loan_data.dict())
        new_loan.remaining_balance = new_loan.amount
        new_loan.status = LoanStatus.pending
        
        await loans_collection.insert_one(new_loan.dict())
        
        return LoansResponse(
            success=True, 
            data=[new_loan], 
            message="Loan application submitted successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating loan: {e}")
        raise HTTPException(status_code=500, detail="Failed to create loan")

@router.get("/{loan_id}")
async def get_loan(loan_id: str):
    """Get loan details by ID"""
    try:
        loan_doc = await find_one_and_convert(loans_collection, {"id": loan_id})
        
        if not loan_doc:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        loan = Loan(**loan_doc)
        return {"success": True, "data": loan}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting loan: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve loan")

@router.put("/{loan_id}")
async def update_loan(loan_id: str, loan_update: LoanUpdate):
    """Update loan status and details"""
    try:
        update_data = {k: v for k, v in loan_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await loans_collection.update_one(
            {"id": loan_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        updated_loan = await find_one_and_convert(loans_collection, {"id": loan_id})
        loan = Loan(**updated_loan)
        
        return {"success": True, "data": loan, "message": "Loan updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating loan: {e}")
        raise HTTPException(status_code=500, detail="Failed to update loan")

@router.post("/{loan_id}/approve")
async def approve_loan(loan_id: str):
    """Approve a loan and disburse funds"""
    try:
        loan_doc = await find_one_and_convert(loans_collection, {"id": loan_id})
        if not loan_doc:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        loan = Loan(**loan_doc)
        
        if loan.status != LoanStatus.pending:
            raise HTTPException(status_code=400, detail="Loan is not in pending status")
        
        # Update loan status
        start_date = datetime.utcnow()
        next_payment_due = start_date + timedelta(days=30)  # Monthly payments
        
        await loans_collection.update_one(
            {"id": loan_id},
            {
                "$set": {
                    "status": LoanStatus.active,
                    "start_date": start_date,
                    "next_payment_due": next_payment_due,
                    "next_payment_amount": loan.remaining_balance / loan.term,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        # Create disbursement transaction
        transaction = Transaction(
            dealer_id=loan.dealer_id,
            type=TransactionType.loan_disbursement,
            amount=loan.amount,
            currency=loan.currency,
            loan_id=loan_id,
            status="confirmed",
            tx_hash=f"0x{''.join(['a', 'b', 'c', 'd', 'e', 'f'] + [str(i) for i in range(10)][:40])}"  # Mock hash
        )
        
        await transactions_collection.insert_one(transaction.dict())
        
        # Update dealer stats
        await dealers_collection.update_one(
            {"id": loan.dealer_id},
            {
                "$inc": {
                    "total_loaned": loan.amount,
                    "active_loans": 1,
                    "anvl_tokens": 100  # Reward tokens
                }
            }
        )
        
        return {"success": True, "message": "Loan approved and funds disbursed"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error approving loan: {e}")
        raise HTTPException(status_code=500, detail="Failed to approve loan")

@router.post("/{loan_id}/payment")
async def make_payment(loan_id: str, payment_amount: float, method: str = "ACH"):
    """Make a payment towards a loan"""
    try:
        loan_doc = await find_one_and_convert(loans_collection, {"id": loan_id})
        if not loan_doc:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        loan = Loan(**loan_doc)
        
        if loan.status != LoanStatus.active:
            raise HTTPException(status_code=400, detail="Loan is not active")
        
        if payment_amount > loan.remaining_balance:
            payment_amount = loan.remaining_balance
        
        new_balance = loan.remaining_balance - payment_amount
        loan_status = LoanStatus.paid if new_balance == 0 else LoanStatus.active
        
        # Update loan
        update_data = {
            "remaining_balance": new_balance,
            "status": loan_status,
            "updated_at": datetime.utcnow()
        }
        
        if new_balance == 0:
            update_data["paid_off_date"] = datetime.utcnow()
        else:
            # Calculate next payment
            update_data["next_payment_due"] = datetime.utcnow() + timedelta(days=30)
            update_data["next_payment_amount"] = min(
                new_balance / max(1, loan.term - 1), 
                new_balance
            )
        
        await loans_collection.update_one({"id": loan_id}, {"$set": update_data})
        
        # Create payment transaction
        transaction = Transaction(
            dealer_id=loan.dealer_id,
            type=TransactionType.payment,
            amount=payment_amount,
            currency="USD",
            loan_id=loan_id,
            method=method,
            status="confirmed"
        )
        
        await transactions_collection.insert_one(transaction.dict())
        
        # Update dealer stats
        dealer_update = {"$inc": {"total_repaid": payment_amount}}
        if new_balance == 0:
            dealer_update["$inc"]["active_loans"] = -1
        
        await dealers_collection.update_one({"id": loan.dealer_id}, dealer_update)
        
        return {
            "success": True, 
            "message": "Payment processed successfully",
            "remaining_balance": new_balance,
            "loan_status": loan_status
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to process payment")

@router.get("/")
async def get_all_loans(dealer_id: str = None, status: LoanStatus = None):
    """Get loans with optional filters"""
    try:
        filter_dict = {}
        if dealer_id:
            filter_dict["dealer_id"] = dealer_id
        if status:
            filter_dict["status"] = status
        
        loans = await find_many_and_convert(
            loans_collection, 
            filter_dict,
            sort=[("created_at", -1)]
        )
        
        return LoansResponse(success=True, data=loans)
        
    except Exception as e:
        logger.error(f"Error getting loans: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve loans")