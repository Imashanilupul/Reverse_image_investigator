import json
import os
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import hashlib
import logging
from ..models.schemas import ConsentForm

logger = logging.getLogger(__name__)

class ConsentManager:
    def __init__(self, consent_db_path: str = "consent_records.json"):
        self.consent_db_path = consent_db_path
        self.logger = logging.getLogger(__name__)
        self._ensure_consent_db()
    
    def _ensure_consent_db(self):
        """Ensure consent database file exists"""
        if not os.path.exists(self.consent_db_path):
            with open(self.consent_db_path, 'w') as f:
                json.dump({"consents": [], "version": "1.0"}, f)
    
    def validate_consent(self, consent_form: ConsentForm) -> Dict[str, Any]:
        """Validate and store user consent"""
        try:
            # Validate required fields
            if not all([
                consent_form.user_id,
                consent_form.full_name,
                consent_form.email,
                consent_form.purpose,
                consent_form.agreed_to_terms
            ]):
                return {"valid": False, "error": "Missing required fields"}
            
            if not consent_form.agreed_to_terms:
                return {"valid": False, "error": "Terms must be accepted"}
            
            # Generate consent hash for tracking
            consent_hash = self._generate_consent_hash(consent_form)
            
            # Check if consent already exists and is valid
            existing_consent = self._check_existing_consent(consent_form.user_id, consent_form.purpose)
            if existing_consent and existing_consent['valid']:
                return {
                    "valid": True, 
                    "message": "Valid consent already exists",
                    "consent_id": existing_consent['consent_id']
                }
            
            # Store new consent
            consent_record = {
                "consent_id": consent_hash,
                "user_id": consent_form.user_id,
                "full_name": consent_form.full_name,
                "email": consent_form.email,
                "purpose": consent_form.purpose,
                "consent_types": consent_form.consent_types,
                "duration_days": consent_form.duration_days,
                "timestamp": datetime.now().isoformat(),
                "expires_at": (datetime.now() + timedelta(days=consent_form.duration_days)).isoformat(),
                "ip_address": consent_form.ip_address,
                "user_agent": consent_form.user_agent,
                "agreed_to_terms": consent_form.agreed_to_terms,
                "revoked": False
            }
            
            self._store_consent(consent_record)
            
            return {
                "valid": True,
                "consent_id": consent_hash,
                "expires_at": consent_record["expires_at"],
                "message": "Consent recorded successfully"
            }
            
        except Exception as e:
            self.logger.error(f"Consent validation failed: {str(e)}")
            return {"valid": False, "error": "Consent processing failed"}
    
    def _generate_consent_hash(self, consent_form: ConsentForm) -> str:
        """Generate unique hash for consent record"""
        consent_string = f"{consent_form.user_id}_{consent_form.purpose}_{datetime.now().date()}"
        return hashlib.sha256(consent_string.encode()).hexdigest()[:16]
    
    def _check_existing_consent(self, user_id: str, purpose: str) -> Optional[Dict[str, Any]]:
        """Check if valid consent already exists"""
        try:
            with open(self.consent_db_path, 'r') as f:
                db = json.load(f)
            
            for consent in db['consents']:
                if (consent['user_id'] == user_id and 
                    consent['purpose'] == purpose and 
                    not consent['revoked']):
                    
                    # Check if consent is still valid (not expired)
                    expires_at = datetime.fromisoformat(consent['expires_at'])
                    if expires_at > datetime.now():
                        return {"valid": True, "consent_id": consent['consent_id']}
                    
            return None
        except Exception as e:
            self.logger.error(f"Error checking existing consent: {str(e)}")
            return None
    
    def _store_consent(self, consent_record: Dict[str, Any]):
        """Store consent record in database"""
        try:
            with open(self.consent_db_path, 'r') as f:
                db = json.load(f)
            
            db['consents'].append(consent_record)
            
            with open(self.consent_db_path, 'w') as f:
                json.dump(db, f, indent=2)
                
            self.logger.info(f"Consent recorded for user {consent_record['user_id']}")
            
        except Exception as e:
            self.logger.error(f"Error storing consent: {str(e)}")
            raise
    
    def log_consent(self, consent_info: Dict[str, Any]):
        """Log consent usage for audit purposes"""
        try:
            audit_record = {
                "timestamp": datetime.now().isoformat(),
                "action": "face_recognition_performed",
                "user_id": consent_info.get("user_id"),
                "purpose": consent_info.get("purpose"),
                "ip_address": consent_info.get("ip_address"),
                "consent_verified": consent_info.get("consent_provided", False)
            }
            
            # Store audit log
            audit_file = "consent_audit.json"
            if os.path.exists(audit_file):
                with open(audit_file, 'r') as f:
                    audit_log = json.load(f)
            else:
                audit_log = {"audit_records": []}
            
            audit_log["audit_records"].append(audit_record)
            
            with open(audit_file, 'w') as f:
                json.dump(audit_log, f, indent=2)
                
        except Exception as e:
            self.logger.error(f"Audit logging failed: {str(e)}")
    
    def revoke_consent(self, user_id: str, consent_id: str) -> bool:
        """Revoke user consent"""
        try:
            with open(self.consent_db_path, 'r') as f:
                db = json.load(f)
            
            for consent in db['consents']:
                if (consent['user_id'] == user_id and 
                    consent['consent_id'] == consent_id):
                    consent['revoked'] = True
                    consent['revoked_at'] = datetime.now().isoformat()
                    break
            
            with open(self.consent_db_path, 'w') as f:
                json.dump(db, f, indent=2)
            
            self.logger.info(f"Consent {consent_id} revoked for user {user_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Consent revocation failed: {str(e)}")
            return False
    
    def get_current_timestamp(self) -> str:
        """Get current timestamp in ISO format"""
        return datetime.now().isoformat()
    
    def cleanup_expired_consents(self):
        """Remove expired consent records"""
        try:
            with open(self.consent_db_path, 'r') as f:
                db = json.load(f)
            
            current_time = datetime.now()
            active_consents = []
            
            for consent in db['consents']:
                expires_at = datetime.fromisoformat(consent['expires_at'])
                if expires_at > current_time or consent['revoked']:
                    active_consents.append(consent)
            
            db['consents'] = active_consents
            
            with open(self.consent_db_path, 'w') as f:
                json.dump(db, f, indent=2)
                
            self.logger.info("Expired consents cleaned up")
            
        except Exception as e:
            self.logger.error(f"Consent cleanup failed: {str(e)}")