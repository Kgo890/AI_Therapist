from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from collections import deque
from backend.app.db.mongo import users_collection, blacklist_collection, conversation_collection
from backend.app.schemas.auth_schemas import (
    UserRegister,
    UserLogin,
    PasswordReset,
    TokenResponse,
    RefreshTokenRequest,
    LogoutRequest,
)
from backend.app.schemas.conversation_schemas import ConversationEntry

from backend.app.utils.user_handling_token import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    blacklist_token,
    get_current_user
)

auth_router = APIRouter(prefix="/auth", tags=["Auth"])
security = HTTPBearer()


@auth_router.post("/register")
async def register_user(user: UserRegister):
    try:
        existing_user = users_collection.find_one({"email": user.email})
        existing_username = users_collection.find_one({"username": user.username})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        if existing_username:
            raise HTTPException(status_code=400, detail="Username already registered")

        hashed_pw = hash_password(user.password)

        user_data = {
            "username": user.username,
            "email": user.email,
            "hashed_password": hashed_pw
        }

        users_collection.insert_one(user_data)
        return {"message": "User registered successfully"}

    except Exception as e:
        print(f"[Register Error] {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@auth_router.post("/login")
def login(user_credentials: UserLogin):

    user = users_collection.find_one({"email": user_credentials.email})
    if not user:
        print("User not found")
        raise HTTPException(status_code=400, detail="Invalid email or password")

    if not verify_password(user_credentials.password, user["hashed_password"]):
        print("Password mismatch")
        raise HTTPException(status_code=400, detail="Invalid email or password")

    print("Login successful")
    access_token = create_access_token({"sub": user_credentials.email})
    refresh_token = create_refresh_token({"sub": user_credentials.email})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@auth_router.post("/refresh", response_model=TokenResponse)
async def refreshing_token(data: RefreshTokenRequest):
    token = data.refresh_token
    if not token:
        raise HTTPException(status_code=400, detail="Refresh token is missing.")

    if blacklist_collection.find_one({"token": token}):
        raise HTTPException(status_code=401, detail="Refresh token is blacklisted.")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token.")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    new_access_token = create_access_token({"sub": email})
    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


@auth_router.post("/reset-password")
def reset_password(data: PasswordReset):
    user = users_collection.find_one({"email": data.email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if not verify_password(data.current_password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid current password.")

    new_hashed = hash_password(data.new_password)
    users_collection.update_one(
        {"email": data.email},
        {"$set": {"hashed_password": new_hashed}}
    )
    return {"message": "Password reset successful."}


@auth_router.post("/logout")
def logging_out(
        data: LogoutRequest,
        credentials: HTTPAuthorizationCredentials = Depends(security)
):
    access_token = credentials.credentials
    refresh_token = data.refresh_token

    blacklist_token(access_token)
    blacklist_token(refresh_token)

    return {"message": "Access and refresh tokens revoked (blacklisted)."}


@auth_router.post("/save_conversation")
def save_conversation(entry: ConversationEntry, user=Depends(get_current_user)):
    user_id = str(user["_id"])
    user_doc = conversation_collection.find_one({"user_id": user_id})

    if user_doc:
        conversation = deque(user_doc["conversation"], maxlen=3)
        conversation.appendleft(entry.model_dump())
        conversation_collection.update_one(
            {"user_id": user_id},
            {"$set": {"conversation": list(conversation)}}
        )
    else:
        conversation_collection.insert_one({
            "user_id": user_id,
            "conversation": [entry.model_dump()]
        })

    return {"message": "Conversation saved successfully."}


@auth_router.get("/get_conversation")
def get_conversations(user=Depends(get_current_user)):
    user_id = str(user["_id"])
    user_doc = conversation_collection.find_one({"user_id": user_id})
    if user_doc:
        return user_doc["conversation"]
    return {"message": "No conversation found."}
