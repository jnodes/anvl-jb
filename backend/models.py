from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class DealerStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    suspended = "suspended"

class LoanStatus(str, Enum):
    pending = "pending"
    active = "active"
    paid = "paid"
    overdue = "overdue"

class VehicleStatus(str, Enum):
    on_lot = "on_lot"
    sold = "sold"
    pending = "pending"

class AuditStatus(str, Enum):
    compliant = "compliant"
    flagged = "flagged"
    violation = "violation"

class TransactionType(str, Enum):
    loan_disbursement = "loan_disbursement"
    payment = "payment"
    anvl_reward = "anvl_reward"
    fee = "fee"

class NotificationSeverity(str, Enum):
    info = "info"
    warning = "warning"
    error = "error"

# GPS Location
class GPSLocation(BaseModel):
    lat: float
    lng: float

# Dealer Models
class DealerBase(BaseModel):
    name: str
    address: str
    phone: str
    email: str

class DealerCreate(DealerBase):
    wallet_address: str

class DealerUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    ach_connected: Optional[bool] = None
    kyc_status: Optional[DealerStatus] = None

class Dealer(DealerBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    ach_connected: bool = False
    kyc_status: DealerStatus = DealerStatus.pending
    anvl_tokens: int = 0
    total_loaned: float = 0
    total_repaid: float = 0
    active_loans: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Loan Models
class LoanBase(BaseModel):
    amount: float
    currency: str = "USDC"
    interest_rate: float = 9.0
    flat_fee: float = 50.0
    term: int = 6  # months

class LoanCreate(LoanBase):
    dealer_id: str
    vehicles_financed: int

class LoanUpdate(BaseModel):
    status: Optional[LoanStatus] = None
    remaining_balance: Optional[float] = None
    next_payment_due: Optional[datetime] = None
    next_payment_amount: Optional[float] = None

class Loan(LoanBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    status: LoanStatus = LoanStatus.pending
    remaining_balance: float
    vehicles_financed: int
    start_date: Optional[datetime] = None
    next_payment_due: Optional[datetime] = None
    next_payment_amount: Optional[float] = None
    paid_off_date: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Vehicle Models
class VehicleBase(BaseModel):
    vin: str
    make: str
    model: str
    year: int
    mileage: int
    color: str
    price: float

class VehicleCreate(VehicleBase):
    dealer_id: str
    loan_id: Optional[str] = None

class VehicleUpdate(BaseModel):
    mileage: Optional[int] = None
    price: Optional[float] = None
    status: Optional[VehicleStatus] = None
    sold_date: Optional[datetime] = None

class Vehicle(VehicleBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    status: VehicleStatus = VehicleStatus.on_lot
    nfc_tag_id: Optional[str] = None
    nft_token_id: Optional[str] = None
    loan_id: Optional[str] = None
    last_audit: Optional[datetime] = None
    gps_location: Optional[GPSLocation] = None
    sold_date: Optional[datetime] = None
    images: List[str] = []
    ipfs_hash: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# Audit Models
class AuditBase(BaseModel):
    vehicle_id: str
    vin: str
    location: GPSLocation
    notes: str = ""

class AuditCreate(AuditBase):
    dealer_id: str
    auditor_wallet: str
    nfc_tag_scanned: bool = True

class Audit(AuditBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: AuditStatus = AuditStatus.compliant
    auditor_wallet: str
    nfc_tag_scanned: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Transaction Models
class TransactionBase(BaseModel):
    amount: float
    currency: str

class TransactionCreate(TransactionBase):
    dealer_id: str
    type: TransactionType
    loan_id: Optional[str] = None
    method: Optional[str] = None  # ACH, blockchain, etc.

class Transaction(TransactionBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    type: TransactionType
    loan_id: Optional[str] = None
    method: Optional[str] = None
    tx_hash: Optional[str] = None
    status: str = "pending"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Notification Models
class NotificationBase(BaseModel):
    title: str
    message: str
    type: str

class NotificationCreate(NotificationBase):
    dealer_id: str
    severity: NotificationSeverity = NotificationSeverity.info

class Notification(NotificationBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    dealer_id: str
    severity: NotificationSeverity
    read: bool = False
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Response Models
class DealerResponse(BaseModel):
    success: bool
    data: Optional[Dealer] = None
    message: str = ""

class LoansResponse(BaseModel):
    success: bool
    data: Optional[List[Loan]] = None
    message: str = ""

class VehiclesResponse(BaseModel):
    success: bool
    data: Optional[List[Vehicle]] = None
    message: str = ""

class AuditsResponse(BaseModel):
    success: bool
    data: Optional[List[Audit]] = None
    message: str = ""

class TransactionsResponse(BaseModel):
    success: bool
    data: Optional[List[Transaction]] = None
    message: str = ""

class NotificationsResponse(BaseModel):
    success: bool
    data: Optional[List[Notification]] = None
    message: str = ""