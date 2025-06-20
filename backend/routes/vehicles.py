from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime
import logging
import uuid

from ..models import (
    Vehicle, VehicleCreate, VehicleUpdate, VehiclesResponse,
    VehicleStatus, GPSLocation
)
from ..database import (
    vehicles_collection, dealers_collection, loans_collection,
    find_one_and_convert, find_many_and_convert
)

router = APIRouter(prefix="/vehicles", tags=["vehicles"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=VehiclesResponse)
async def create_vehicle(vehicle_data: VehicleCreate):
    """Add a new vehicle to inventory"""
    try:
        # Verify dealer exists
        dealer = await find_one_and_convert(dealers_collection, {"id": vehicle_data.dealer_id})
        if not dealer:
            raise HTTPException(status_code=404, detail="Dealer not found")
        
        # Check if VIN already exists
        existing_vehicle = await find_one_and_convert(vehicles_collection, {"vin": vehicle_data.vin})
        if existing_vehicle:
            raise HTTPException(status_code=400, detail="Vehicle with this VIN already exists")
        
        # Create vehicle
        new_vehicle = Vehicle(**vehicle_data.dict())
        new_vehicle.nfc_tag_id = f"nfc_{str(uuid.uuid4())[:8]}"
        new_vehicle.nft_token_id = f"nft_{str(uuid.uuid4())[:8]}"
        new_vehicle.ipfs_hash = f"Qm{str(uuid.uuid4()).replace('-', '')}[:44]"
        
        await vehicles_collection.insert_one(new_vehicle.dict())
        
        return VehiclesResponse(
            success=True, 
            data=[new_vehicle], 
            message="Vehicle added to inventory successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating vehicle: {e}")
        raise HTTPException(status_code=500, detail="Failed to create vehicle")

@router.get("/{vehicle_id}")
async def get_vehicle(vehicle_id: str):
    """Get vehicle details by ID"""
    try:
        vehicle_doc = await find_one_and_convert(vehicles_collection, {"id": vehicle_id})
        
        if not vehicle_doc:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        vehicle = Vehicle(**vehicle_doc)
        return {"success": True, "data": vehicle}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting vehicle: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve vehicle")

@router.get("/vin/{vin}")
async def get_vehicle_by_vin(vin: str):
    """Get vehicle details by VIN"""
    try:
        vehicle_doc = await find_one_and_convert(vehicles_collection, {"vin": vin})
        
        if not vehicle_doc:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        vehicle = Vehicle(**vehicle_doc)
        return {"success": True, "data": vehicle}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting vehicle by VIN: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve vehicle")

@router.put("/{vehicle_id}")
async def update_vehicle(vehicle_id: str, vehicle_update: VehicleUpdate):
    """Update vehicle details"""
    try:
        update_data = {k: v for k, v in vehicle_update.dict().items() if v is not None}
        update_data["updated_at"] = datetime.utcnow()
        
        result = await vehicles_collection.update_one(
            {"id": vehicle_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        updated_vehicle = await find_one_and_convert(vehicles_collection, {"id": vehicle_id})
        vehicle = Vehicle(**updated_vehicle)
        
        return {"success": True, "data": vehicle, "message": "Vehicle updated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating vehicle: {e}")
        raise HTTPException(status_code=500, detail="Failed to update vehicle")

@router.post("/{vehicle_id}/sell")
async def sell_vehicle(vehicle_id: str, sale_price: Optional[float] = None):
    """Mark vehicle as sold"""
    try:
        vehicle_doc = await find_one_and_convert(vehicles_collection, {"id": vehicle_id})
        if not vehicle_doc:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        vehicle = Vehicle(**vehicle_doc)
        
        if vehicle.status == VehicleStatus.sold:
            raise HTTPException(status_code=400, detail="Vehicle is already sold")
        
        update_data = {
            "status": VehicleStatus.sold,
            "sold_date": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        if sale_price:
            update_data["price"] = sale_price
        
        await vehicles_collection.update_one({"id": vehicle_id}, {"$set": update_data})
        
        return {"success": True, "message": "Vehicle marked as sold"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error selling vehicle: {e}")
        raise HTTPException(status_code=500, detail="Failed to sell vehicle")

@router.post("/{vehicle_id}/location")
async def update_vehicle_location(vehicle_id: str, location: GPSLocation):
    """Update vehicle GPS location"""
    try:
        result = await vehicles_collection.update_one(
            {"id": vehicle_id},
            {
                "$set": {
                    "gps_location": location.dict(),
                    "last_audit": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        return {"success": True, "message": "Vehicle location updated"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating vehicle location: {e}")
        raise HTTPException(status_code=500, detail="Failed to update location")

@router.get("/")
async def get_vehicles(
    dealer_id: Optional[str] = None,
    status: Optional[VehicleStatus] = None,
    loan_id: Optional[str] = None
):
    """Get vehicles with optional filters"""
    try:
        filter_dict = {}
        if dealer_id:
            filter_dict["dealer_id"] = dealer_id
        if status:
            filter_dict["status"] = status
        if loan_id:
            filter_dict["loan_id"] = loan_id
        
        vehicles = await find_many_and_convert(
            vehicles_collection, 
            filter_dict,
            sort=[("created_at", -1)]
        )
        
        return VehiclesResponse(success=True, data=vehicles)
        
    except Exception as e:
        logger.error(f"Error getting vehicles: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve vehicles")

@router.delete("/{vehicle_id}")
async def delete_vehicle(vehicle_id: str):
    """Delete a vehicle from inventory"""
    try:
        result = await vehicles_collection.delete_one({"id": vehicle_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        return {"success": True, "message": "Vehicle deleted successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting vehicle: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete vehicle")