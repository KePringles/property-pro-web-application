
# app/models/search.py
from datetime import datetime
from app import db

class SearchHistory(db.Model):
    __tablename__ = 'search_history'
    
    search_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'))
    search_query = db.Column(db.Text, nullable=False)
    search_params = db.Column(db.JSON)
    search_date = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', back_populates='search_history')
    
    def to_dict(self):
        return {
            'search_id': self.search_id,
            'user_id': self.user_id,
            'search_query': self.search_query,
            'search_params': self.search_params,
            'search_date': self.search_date.isoformat() if self.search_date else None
        }