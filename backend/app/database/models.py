from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database.connection import Base


class Habit(Base):
    __tablename__ = "habits"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    target_value = Column(Float, nullable=False)
    unit = Column(String, nullable=False)
    frequency = Column(String, default="daily")
    category = Column(String, default="Other")
    difficulty = Column(String, default="medium")
    active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    logs = relationship("HabitLog", back_populates="habit", cascade="all, delete-orphan")
    adjustments = relationship("GoalAdjustment", back_populates="habit", cascade="all, delete-orphan")


class HabitLog(Base):
    __tablename__ = "habit_logs"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    date = Column(Date, nullable=False)
    actual_value = Column(Float, nullable=False)
    completed = Column(Boolean, default=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    habit = relationship("Habit", back_populates="logs")


class GoalAdjustment(Base):
    __tablename__ = "goal_adjustments"

    id = Column(Integer, primary_key=True, index=True)
    habit_id = Column(Integer, ForeignKey("habits.id"), nullable=False)
    old_target = Column(Float, nullable=False)
    new_target = Column(Float, nullable=False)
    reason = Column(Text, nullable=False)
    adjustment_type = Column(String, nullable=False)  # increase / decrease
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    habit = relationship("Habit", back_populates="adjustments")
