"""
Shared slowapi Limiter instance - imported by main.py (to register it on the app
and wire up the 429 handler) and by any router module that wants to decorate a
route with @limiter.limit(...). Kept in its own module so both sides import the
same instance rather than each creating their own.
"""
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)
