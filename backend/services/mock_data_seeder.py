"""
Mock data seeder for ANVL development
This script populates the database with sample data for testing
"""
import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from datetime import datetime, timedelta
from database import (
    dealers_collection, loans_collection, vehicles_collection, 
    audits_collection, transactions_collection, notifications_collection
)
from models import *

async def seed_mock_data():
    """Seed the database with mock data"""
    
    # Clear existing data
    await dealers_collection.delete_many({})
    await loans_collection.delete_many({})
    await vehicles_collection.delete_many({})
    await audits_collection.delete_many({})
    await transactions_collection.delete_many({})
    await notifications_collection.delete_many({})
    
    # Create mock dealer
    dealer = Dealer(
        id='dealer_123',
        name='Sunset Motors',
        address='123 Main St, Los Angeles, CA 90210',
        phone='+1 (555) 123-4567',
        email='admin@sunsetmotors.com',
        wallet_address='0x742d35Cc6635C0532925a3b8D40120f4',
        ach_connected=True,
        kyc_status=DealerStatus.approved,
        anvl_tokens=2500,
        total_loaned=485000,
        total_repaid=320000,
        active_loans=3
    )
    await dealers_collection.insert_one(dealer.dict())
    
    # Create mock loans
    loans = [
        Loan(
            id='loan_001',
            dealer_id='dealer_123',
            amount=150000,
            currency='USDC',
            interest_rate=9,
            flat_fee=50,
            term=6,
            status=LoanStatus.active,
            remaining_balance=125000,
            vehicles_financed=5,
            start_date=datetime(2024, 1, 15),
            next_payment_due=datetime(2024, 7, 15),
            next_payment_amount=25000
        ),
        Loan(
            id='loan_002',
            dealer_id='dealer_123',
            amount=200000,
            currency='USDC',
            interest_rate=9,
            flat_fee=50,
            term=6,
            status=LoanStatus.active,
            remaining_balance=165000,
            vehicles_financed=7,
            start_date=datetime(2024, 2, 1),
            next_payment_due=datetime(2024, 8, 1),
            next_payment_amount=35000
        ),
        Loan(
            id='loan_003',
            dealer_id='dealer_123',
            amount=100000,
            currency='USDC',
            interest_rate=9,
            flat_fee=50,
            term=6,
            status=LoanStatus.paid,
            remaining_balance=0,
            vehicles_financed=3,
            start_date=datetime(2023, 10, 1),
            paid_off_date=datetime(2024, 4, 1)
        )
    ]
    for loan in loans:
        await loans_collection.insert_one(loan.dict())
    
    # Create mock vehicles
    vehicles = [
        Vehicle(
            id='vehicle_001',
            dealer_id='dealer_123',
            vin='1HGBH41JXMN109186',
            make='Honda',
            model='Accord',
            year=2023,
            mileage=12500,
            color='Silver',
            price=28500,
            status=VehicleStatus.on_lot,
            nfc_tag_id='nfc_001',
            nft_token_id='nft_001',
            loan_id='loan_001',
            last_audit=datetime(2024, 6, 15, 10, 30),
            gps_location=GPSLocation(lat=34.0522, lng=-118.2437),
            ipfs_hash='QmX8J9K2L3M4N5O6P7Q8R9S0T1U2V3W4X5Y6Z7A8B9C0D'
        ),
        Vehicle(
            id='vehicle_002',
            dealer_id='dealer_123',
            vin='2HGBH41JXMN109187',
            make='Toyota',
            model='Camry',
            year=2023,
            mileage=8200,
            color='Blue',
            price=32000,
            status=VehicleStatus.on_lot,
            nfc_tag_id='nfc_002',
            nft_token_id='nft_002',
            loan_id='loan_001',
            last_audit=datetime(2024, 6, 14, 15, 45),
            gps_location=GPSLocation(lat=34.0522, lng=-118.2437),
            ipfs_hash='QmY9K0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E'
        ),
        Vehicle(
            id='vehicle_003',
            dealer_id='dealer_123',
            vin='3HGBH41JXMN109188',
            make='Ford',
            model='F-150',
            year=2023,
            mileage=15600,
            color='Black',
            price=45000,
            status=VehicleStatus.sold,
            nfc_tag_id='nfc_003',
            nft_token_id='nft_003',
            loan_id='loan_002',
            last_audit=datetime(2024, 6, 10, 9, 15),
            sold_date=datetime(2024, 6, 12),
            ipfs_hash='QmZ0L1M2N3O4P5Q6R7S8T9U0V1W2X3Y4Z5A6B7C8D9E0F'
        )
    ]
    for vehicle in vehicles:
        await vehicles_collection.insert_one(vehicle.dict())
    
    # Create mock audits
    audits = [
        Audit(
            id='audit_001',
            dealer_id='dealer_123',
            vehicle_id='vehicle_001',
            vin='1HGBH41JXMN109186',
            timestamp=datetime(2024, 6, 15, 10, 30),
            location=GPSLocation(lat=34.0522, lng=-118.2437),
            status=AuditStatus.compliant,
            auditor_wallet='0x742d35Cc6635C0532925a3b8D40120f4',
            nfc_tag_scanned=True,
            notes='Vehicle on lot, all systems normal'
        ),
        Audit(
            id='audit_002',
            dealer_id='dealer_123',
            vehicle_id='vehicle_002',
            vin='2HGBH41JXMN109187',
            timestamp=datetime(2024, 6, 14, 15, 45),
            location=GPSLocation(lat=34.0525, lng=-118.2440),
            status=AuditStatus.flagged,
            auditor_wallet='0x742d35Cc6635C0532925a3b8D40120f4',
            nfc_tag_scanned=True,
            notes='Vehicle location slightly off designated area'
        )
    ]
    for audit in audits:
        await audits_collection.insert_one(audit.dict())
    
    # Create mock transactions
    transactions = [
        Transaction(
            id='tx_001',
            dealer_id='dealer_123',
            type=TransactionType.loan_disbursement,
            amount=150000,
            currency='USDC',
            loan_id='loan_001',
            tx_hash='0x1234567890abcdef1234567890abcdef12345678',
            status='confirmed',
            timestamp=datetime(2024, 1, 15, 12, 0)
        ),
        Transaction(
            id='tx_002',
            dealer_id='dealer_123',
            type=TransactionType.payment,
            amount=25000,
            currency='USD',
            loan_id='loan_001',
            method='ACH',
            status='confirmed',
            timestamp=datetime(2024, 3, 15, 9, 30)
        ),
        Transaction(
            id='tx_003',
            dealer_id='dealer_123',
            type=TransactionType.anvl_reward,
            amount=500,
            currency='ANVL',
            tx_hash='0xabcdef1234567890abcdef1234567890abcdef12',
            status='confirmed',
            timestamp=datetime(2024, 1, 15, 12, 5)
        )
    ]
    for transaction in transactions:
        await transactions_collection.insert_one(transaction.dict())
    
    # Create mock notifications
    notifications = [
        Notification(
            id='notif_001',
            dealer_id='dealer_123',
            type='compliance_alert',
            title='Vehicle Location Alert',
            message='Vehicle VIN 2HGBH41JXMN109187 flagged for location compliance',
            severity=NotificationSeverity.warning,
            read=False,
            timestamp=datetime(2024, 6, 14, 15, 50)
        ),
        Notification(
            id='notif_002',
            dealer_id='dealer_123',
            type='payment_reminder',
            title='Payment Due Soon',
            message='Loan payment of $25,000 due on July 15th',
            severity=NotificationSeverity.info,
            read=True,
            timestamp=datetime(2024, 6, 10, 10, 0)
        )
    ]
    for notification in notifications:
        await notifications_collection.insert_one(notification.dict())
    
    print("Mock data seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_mock_data())