from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..models import (
    Transaction, TransactionCreate, TransactionsResponse,
    TransactionType
)
from ..database import (
    transactions_collection, dealers_collection, loans_collection,
    find_one_and_convert, find_many_and_convert
)

router = APIRouter(prefix="/transactions", tags=["transactions"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=TransactionsResponse)
async def create_transaction(transaction_data: TransactionCreate):
    """Create a new transaction record"""
    try:
        # Verify dealer exists
        dealer = await find_one_and_convert(dealers_collection, {"id": transaction_data.dealer_id})
        if not dealer:
            raise HTTPException(status_code=404, detail="Dealer not found")
        
        # Create transaction
        new_transaction = Transaction(**transaction_data.dict())
        new_transaction.status = "confirmed"
        
        # Generate mock transaction hash for blockchain transactions
        if transaction_data.type in [TransactionType.loan_disbursement, TransactionType.anvl_reward]:
            new_transaction.tx_hash = f"0x{''.join(['a', 'b', 'c', 'd', 'e', 'f'] + [str(i) for i in range(10)][:40])}"
        
        await transactions_collection.insert_one(new_transaction.dict())
        
        return TransactionsResponse(
            success=True, 
            data=[new_transaction], 
            message="Transaction recorded successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating transaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to create transaction")

@router.get("/{transaction_id}")
async def get_transaction(transaction_id: str):
    """Get transaction details by ID"""
    try:
        transaction_doc = await find_one_and_convert(transactions_collection, {"id": transaction_id})
        
        if not transaction_doc:
            raise HTTPException(status_code=404, detail="Transaction not found")
        
        transaction = Transaction(**transaction_doc)
        return {"success": True, "data": transaction}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting transaction: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve transaction")

@router.get("/")
async def get_transactions(
    dealer_id: Optional[str] = None,
    loan_id: Optional[str] = None,
    type: Optional[TransactionType] = None,
    days: int = 90
):
    """Get transactions with optional filters"""
    try:
        filter_dict = {}
        if dealer_id:
            filter_dict["dealer_id"] = dealer_id
        if loan_id:
            filter_dict["loan_id"] = loan_id
        if type:
            filter_dict["type"] = type
        
        # Filter by date range
        start_date = datetime.utcnow() - timedelta(days=days)
        filter_dict["timestamp"] = {"$gte": start_date}
        
        transactions = await find_many_and_convert(
            transactions_collection, 
            filter_dict,
            sort=[("timestamp", -1)],
            limit=100
        )
        
        return TransactionsResponse(success=True, data=transactions)
        
    except Exception as e:
        logger.error(f"Error getting transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve transactions")

@router.get("/dealer/{dealer_id}/summary")
async def get_dealer_transaction_summary(dealer_id: str, days: int = 30):
    """Get transaction summary for a dealer"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get all transactions for the dealer within the time range
        transactions = await find_many_and_convert(
            transactions_collection,
            {
                "dealer_id": dealer_id,
                "timestamp": {"$gte": start_date}
            }
        )
        
        # Calculate summary stats
        total_disbursed = sum(t.get("amount", 0) for t in transactions if t.get("type") == "loan_disbursement")
        total_payments = sum(t.get("amount", 0) for t in transactions if t.get("type") == "payment")
        total_fees = sum(t.get("amount", 0) for t in transactions if t.get("type") == "fee")
        anvl_earned = sum(t.get("amount", 0) for t in transactions if t.get("type") == "anvl_reward")
        
        return {
            "success": True,
            "data": {
                "period_days": days,
                "total_transactions": len(transactions),
                "total_disbursed": total_disbursed,
                "total_payments": total_payments,
                "total_fees": total_fees,
                "anvl_earned": anvl_earned,
                "net_flow": total_disbursed - total_payments,
                "recent_transactions": transactions[:10]
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting transaction summary: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate transaction summary")

@router.get("/loan/{loan_id}/history")
async def get_loan_transaction_history(loan_id: str):
    """Get transaction history for a specific loan"""
    try:
        transactions = await find_many_and_convert(
            transactions_collection,
            {"loan_id": loan_id},
            sort=[("timestamp", -1)]
        )
        
        return TransactionsResponse(success=True, data=transactions)
        
    except Exception as e:
        logger.error(f"Error getting loan transaction history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve transaction history")

@router.post("/simulate-payment")
async def simulate_ach_payment(dealer_id: str, loan_id: str, amount: float):
    """Simulate an ACH payment (for demo purposes)"""
    try:
        # Verify loan exists
        loan = await find_one_and_convert(loans_collection, {"id": loan_id})
        if not loan:
            raise HTTPException(status_code=404, detail="Loan not found")
        
        # Create payment transaction
        transaction = Transaction(
            dealer_id=dealer_id,
            type=TransactionType.payment,
            amount=amount,
            currency="USD",
            loan_id=loan_id,
            method="ACH",
            status="confirmed"
        )
        
        await transactions_collection.insert_one(transaction.dict())
        
        # Update loan balance (this would normally be done in the loans endpoint)
        new_balance = max(0, loan["remaining_balance"] - amount)
        await loans_collection.update_one(
            {"id": loan_id},
            {
                "$set": {
                    "remaining_balance": new_balance,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return {
            "success": True,
            "message": "Payment processed successfully",
            "transaction_id": transaction.id,
            "new_balance": new_balance
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error simulating payment: {e}")
        raise HTTPException(status_code=500, detail="Failed to process payment")

@router.post("/reward-anvl")
async def reward_anvl_tokens(dealer_id: str, amount: int, reason: str):
    """Award ANVL tokens to a dealer"""
    try:
        # Create ANVL reward transaction
        transaction = Transaction(
            dealer_id=dealer_id,
            type=TransactionType.anvl_reward,
            amount=amount,
            currency="ANVL",
            status="confirmed",
            tx_hash=f"0x{''.join(['a', 'b', 'c', 'd', 'e', 'f'] + [str(i) for i in range(10)][:40])}"
        )
        
        await transactions_collection.insert_one(transaction.dict())
        
        # Update dealer ANVL balance
        await dealers_collection.update_one(
            {"id": dealer_id},
            {"$inc": {"anvl_tokens": amount}}
        )
        
        return {
            "success": True,
            "message": f"Awarded {amount} ANVL tokens for {reason}",
            "transaction_id": transaction.id
        }
        
    except Exception as e:
        logger.error(f"Error rewarding ANVL tokens: {e}")
        raise HTTPException(status_code=500, detail="Failed to reward tokens")