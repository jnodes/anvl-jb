from fastapi import APIRouter, HTTPException, Depends
from typing import List
from datetime import datetime
import logging

from ..models import (
    Dealer, DealerCreate, DealerUpdate, DealerResponse,
    LoansResponse, VehiclesResponse, TransactionsResponse, NotificationsResponse
)
from ..database import (
    dealers_collection, loans_collection, vehicles_collection, 
    transactions_collection, notifications_collection,
    find_one_and_convert, find_many_and_convert
)

router = APIRouter(prefix="/dealers", tags=["dealers"])
logger = logging.getLogger(__name__)

@router.post("/connect-wallet", response_model=DealerResponse)
async def connect_wallet(dealer_data: DealerCreate):
    """Connect wallet and create/retrieve dealer profile"""
    try:
        # Check if dealer already exists
        existing_dealer = await find_one_and_convert(
            dealers_collection, 
            {"wallet_address": dealer_data.wallet_address}
        )
        
        if existing_dealer:
            # Update last login time
            await dealers_collection.update_one(
                {"wallet_address": dealer_data.wallet_address},
                {"$set": {"updated_at": datetime.utcnow()}}
            )
            dealer = Dealer(**existing_dealer)
            return DealerResponse(
                success=True, 
                data=dealer, 
                message="Wallet connected successfully"
            )
        
        # Create new dealer
        new_dealer = Dealer(**dealer_data.dict())
        await dealers_collection.insert_one(new_dealer.dict())
        
        return DealerResponse(
            success=True, 
            data=new_dealer, 
            message="New dealer profile created"
        )
        
    except Exception as e:
        logger.error(f"Error connecting wallet: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect wallet")

@router.get("/{dealer_id}", response_model=DealerResponse)
async def get_dealer(dealer_id: str):
    """Get dealer profile by ID"""
    try:
        dealer_doc = await find_one_and_convert(dealers_collection, {"id": dealer_id})
        
        if not dealer_doc:
            raise HTTPException(status_code=404, detail="Dealer not found")
        
        dealer = Dealer(**dealer_doc)
        return DealerResponse(success=True, data=dealer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dealer: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dealer")

@router.get("/wallet/{wallet_address}", response_model=DealerResponse)
async def get_dealer_by_wallet(wallet_address: str):
    """Get dealer profile by wallet address"""
    try:
        dealer_doc = await find_one_and_convert(
            dealers_collection, 
            {"wallet_address": wallet_address}
        )
        
        if not dealer_doc:
            raise HTTPException(status_code=404, detail="Dealer not found")
        
        dealer = Dealer(**dealer_doc)
        return DealerResponse(success=True, data=dealer)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting dealer by wallet: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve dealer")

@router.put("/{dealer_id}", response_model=DealerResponse)
async def update_dealer(dealer_id: str, dealer_update: DealerUpdate):
    """Update dealer profile"""
    try:
        update_data = {k: v for k, v in dealer_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await dealers_collection.update_one(
            {"id": dealer_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Dealer not found")
        
        updated_dealer = await find_one_and_convert(dealers_collection, {"id": dealer_id})
        dealer = Dealer(**updated_dealer)
        
        return DealerResponse(
            success=True, 
            data=dealer, 
            message="Dealer profile updated successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating dealer: {e}")
        raise HTTPException(status_code=500, detail="Failed to update dealer")

@router.get("/{dealer_id}/loans", response_model=LoansResponse)
async def get_dealer_loans(dealer_id: str):
    """Get all loans for a dealer"""
    try:
        loans = await find_many_and_convert(
            loans_collection, 
            {"dealer_id": dealer_id},
            sort=[("created_at", -1)]
        )
        
        return LoansResponse(success=True, data=loans)
        
    except Exception as e:
        logger.error(f"Error getting dealer loans: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve loans")

@router.get("/{dealer_id}/vehicles", response_model=VehiclesResponse)
async def get_dealer_vehicles(dealer_id: str):
    """Get all vehicles for a dealer"""
    try:
        vehicles = await find_many_and_convert(
            vehicles_collection, 
            {"dealer_id": dealer_id},
            sort=[("created_at", -1)]
        )
        
        return VehiclesResponse(success=True, data=vehicles)
        
    except Exception as e:
        logger.error(f"Error getting dealer vehicles: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve vehicles")

@router.get("/{dealer_id}/transactions", response_model=TransactionsResponse)
async def get_dealer_transactions(dealer_id: str):
    """Get all transactions for a dealer"""
    try:
        transactions = await find_many_and_convert(
            transactions_collection, 
            {"dealer_id": dealer_id},
            sort=[("timestamp", -1)],
            limit=50
        )
        
        return TransactionsResponse(success=True, data=transactions)
        
    except Exception as e:
        logger.error(f"Error getting dealer transactions: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve transactions")

@router.get("/{dealer_id}/notifications", response_model=NotificationsResponse)
async def get_dealer_notifications(dealer_id: str):
    """Get all notifications for a dealer"""
    try:
        notifications = await find_many_and_convert(
            notifications_collection, 
            {"dealer_id": dealer_id},
            sort=[("timestamp", -1)],
            limit=20
        )
        
        return NotificationsResponse(success=True, data=notifications)
        
    except Exception as e:
        logger.error(f"Error getting dealer notifications: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve notifications")

@router.post("/{dealer_id}/notifications/{notification_id}/mark-read")
async def mark_notification_read(dealer_id: str, notification_id: str):
    """Mark a notification as read"""
    try:
        result = await notifications_collection.update_one(
            {"id": notification_id, "dealer_id": dealer_id},
            {"$set": {"read": True}}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        
        return {"success": True, "message": "Notification marked as read"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error marking notification as read: {e}")
        raise HTTPException(status_code=500, detail="Failed to update notification")