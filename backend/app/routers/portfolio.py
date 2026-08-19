from fastapi import APIRouter, Depends
from app.database import portfolio_col
from app.models import PortfolioUpdate
from app.auth import require_admin
from app.utils.files import utcnow

router = APIRouter(prefix="/api/portfolio", tags=["portfolio"])

DOC_KEY = {"_singleton": "portfolio"}


@router.get("")
async def get_portfolio():
    doc = await portfolio_col.find_one(DOC_KEY)
    if not doc:
        doc = {**DOC_KEY, "title": "Portfolio", "content": "", "cover_image": None, "updated_at": utcnow()}
        await portfolio_col.insert_one(doc)
    doc.pop("_id", None)
    doc.pop("_singleton", None)
    return doc


@router.put("", dependencies=[Depends(require_admin)])
async def update_portfolio(payload: PortfolioUpdate):
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    update_data["updated_at"] = utcnow()
    await portfolio_col.update_one(DOC_KEY, {"$set": update_data}, upsert=True)
    doc = await portfolio_col.find_one(DOC_KEY)
    doc.pop("_id", None)
    doc.pop("_singleton", None)
    return doc
