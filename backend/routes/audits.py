from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime, timedelta
import logging

from ..models import (
    Audit, AuditCreate, AuditsResponse,
    AuditStatus, Notification, NotificationCreate, NotificationSeverity,
    GPSLocation
)
from ..database import (
    audits_collection, vehicles_collection, dealers_collection, notifications_collection,
    find_one_and_convert, find_many_and_convert
)

router = APIRouter(prefix="/audits", tags=["audits"])
logger = logging.getLogger(__name__)

@router.post("/", response_model=AuditsResponse)
async def create_audit(audit_data: AuditCreate):
    """Create a new NFC audit record"""
    try:
        # Verify vehicle exists
        vehicle = await find_one_and_convert(vehicles_collection, {"id": audit_data.vehicle_id})
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Create audit
        new_audit = Audit(**audit_data.dict())
        
        # Determine compliance status based on location (mock logic)
        dealer_location = GPSLocation(lat=34.0522, lng=-118.2437)  # Mock dealer lot location
        distance = abs(audit_data.location.lat - dealer_location.lat) + abs(audit_data.location.lng - dealer_location.lng)
        
        if distance > 0.005:  # ~500 meters threshold
            new_audit.status = AuditStatus.flagged
            
            # Create compliance notification
            notification = Notification(
                dealer_id=audit_data.dealer_id,
                type="compliance_alert",
                title="Vehicle Location Alert",
                message=f"Vehicle VIN {audit_data.vin} flagged for location compliance",
                severity=NotificationSeverity.warning
            )
            await notifications_collection.insert_one(notification.dict())
        else:
            new_audit.status = AuditStatus.compliant
        
        await audits_collection.insert_one(new_audit.dict())
        
        # Update vehicle last audit time
        await vehicles_collection.update_one(
            {"id": audit_data.vehicle_id},
            {
                "$set": {
                    "last_audit": new_audit.timestamp,
                    "gps_location": audit_data.location.dict(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        return AuditsResponse(
            success=True, 
            data=[new_audit], 
            message="Audit record created successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating audit: {e}")
        raise HTTPException(status_code=500, detail="Failed to create audit")

@router.get("/{audit_id}")
async def get_audit(audit_id: str):
    """Get audit details by ID"""
    try:
        audit_doc = await find_one_and_convert(audits_collection, {"id": audit_id})
        
        if not audit_doc:
            raise HTTPException(status_code=404, detail="Audit not found")
        
        audit = Audit(**audit_doc)
        return {"success": True, "data": audit}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting audit: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve audit")

@router.get("/")
async def get_audits(
    dealer_id: Optional[str] = None,
    vehicle_id: Optional[str] = None,
    status: Optional[AuditStatus] = None,
    days: int = 30
):
    """Get audits with optional filters"""
    try:
        filter_dict = {}
        if dealer_id:
            filter_dict["dealer_id"] = dealer_id
        if vehicle_id:
            filter_dict["vehicle_id"] = vehicle_id
        if status:
            filter_dict["status"] = status
        
        # Filter by date range
        start_date = datetime.utcnow() - timedelta(days=days)
        filter_dict["timestamp"] = {"$gte": start_date}
        
        audits = await find_many_and_convert(
            audits_collection, 
            filter_dict,
            sort=[("timestamp", -1)],
            limit=100
        )
        
        return AuditsResponse(success=True, data=audits)
        
    except Exception as e:
        logger.error(f"Error getting audits: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve audits")

@router.post("/nfc-scan")
async def nfc_scan(vin: str, dealer_id: str, auditor_wallet: str, location: GPSLocation):
    """Process NFC tag scan and create audit"""
    try:
        # Find vehicle by VIN
        vehicle_doc = await find_one_and_convert(vehicles_collection, {"vin": vin})
        if not vehicle_doc:
            raise HTTPException(status_code=404, detail="Vehicle not found")
        
        # Create audit record
        audit_data = AuditCreate(
            vehicle_id=vehicle_doc["id"],
            vin=vin,
            dealer_id=dealer_id,
            auditor_wallet=auditor_wallet,
            location=location,
            nfc_tag_scanned=True,
            notes="NFC tag scanned successfully"
        )
        
        result = await create_audit(audit_data)
        
        return {
            "success": True,
            "message": "NFC scan processed successfully",
            "audit": result.data[0] if result.data else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing NFC scan: {e}")
        raise HTTPException(status_code=500, detail="Failed to process NFC scan")

@router.get("/vehicle/{vehicle_id}/history")
async def get_vehicle_audit_history(vehicle_id: str, limit: int = 20):
    """Get audit history for a specific vehicle"""
    try:
        audits = await find_many_and_convert(
            audits_collection,
            {"vehicle_id": vehicle_id},
            sort=[("timestamp", -1)],
            limit=limit
        )
        
        return AuditsResponse(success=True, data=audits)
        
    except Exception as e:
        logger.error(f"Error getting vehicle audit history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve audit history")

@router.get("/dealer/{dealer_id}/compliance")
async def get_dealer_compliance_report(dealer_id: str, days: int = 30):
    """Get compliance report for a dealer"""
    try:
        start_date = datetime.utcnow() - timedelta(days=days)
        
        # Get all audits for the dealer within the time range
        audits = await find_many_and_convert(
            audits_collection,
            {
                "dealer_id": dealer_id,
                "timestamp": {"$gte": start_date}
            }
        )
        
        # Calculate compliance stats
        total_audits = len(audits)
        compliant_audits = len([a for a in audits if a.get("status") == "compliant"])
        flagged_audits = len([a for a in audits if a.get("status") == "flagged"])
        
        compliance_rate = (compliant_audits / total_audits * 100) if total_audits > 0 else 0
        
        return {
            "success": True,
            "data": {
                "period_days": days,
                "total_audits": total_audits,
                "compliant_audits": compliant_audits,
                "flagged_audits": flagged_audits,
                "compliance_rate": round(compliance_rate, 2),
                "recent_audits": audits[:10]  # Last 10 audits
            }
        }
        
    except Exception as e:
        logger.error(f"Error getting compliance report: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate compliance report")

@router.post("/{audit_id}/resolve")
async def resolve_audit_flag(audit_id: str, resolution_notes: str):
    """Resolve a flagged audit"""
    try:
        result = await audits_collection.update_one(
            {"id": audit_id},
            {
                "$set": {
                    "status": AuditStatus.compliant,
                    "notes": f"{resolution_notes} (Resolved)",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Audit not found")
        
        return {"success": True, "message": "Audit flag resolved successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resolving audit flag: {e}")
        raise HTTPException(status_code=500, detail="Failed to resolve audit")