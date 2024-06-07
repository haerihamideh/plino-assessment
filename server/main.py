import csv
import random
from typing import List
from fastapi import FastAPI, Body, status, HTTPException
from motor.motor_asyncio import (
    AsyncIOMotorClient,
    AsyncIOMotorCollection,
)
from pydantic import BaseModel
from datetime import datetime, date, time
from config import LLMS_CSV_FILE_PATH


class LLM(BaseModel):
    company: str
    category: str
    release_date: date
    model_name: str
    num_million_parameters: int


app = FastAPI()
llms_collection: AsyncIOMotorCollection = AsyncIOMotorClient(
    "mongodb://root:example@mongodb:27017"
)["plino"]["llms"]


@app.get("/")
async def read_root():
    return {"Hello": "World"}


@app.post(
    "/llm",
    status_code=status.HTTP_201_CREATED,
)
async def create_llm(
    llm: LLM | None = Body(None),
) -> None:
    """
    If the request body contains info about a particular LLM, add it to the MongoDB collection.
    Otherwise, read a random LLM from the CSV file and insert it into the.DB.
    """
    if not llm:
        # The user provided no request body, so we create one from a random row
        # from the LLMs CSV file
        with open(LLMS_CSV_FILE_PATH, mode="r") as file:
            reader = csv.DictReader(file)
            llms = list(reader)
            if not llms:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="No LLMs in CSV file",
                )
            chosen_llm = random.choice(llms)
            llm = LLM(
                company=chosen_llm["company"],
                model_name=chosen_llm["model_name"],
                num_million_parameters=int(chosen_llm["num_million_parameters"]),
                release_date=date.fromisoformat(chosen_llm["release_date"]),
                category=chosen_llm["category"],
            )

    existing_llm = await llms_collection.find_one(
        {"company": llm.company, "model_name": llm.model_name}
    )
    if existing_llm:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="LLM already present in DB"
        )
    # MongoDB cannot store dates without times, so we set the time at midnight for the release date
    llm_dict = {
        **llm.dict(),
        "release_date": datetime.combine(llm.release_date, time.min),
    }
    await llms_collection.insert_one(llm_dict)


class GetLLMsResponseBody(BaseModel):
    llms: List[LLM]


@app.get(
    "/llms",
    status_code=status.HTTP_200_OK,
    response_model=GetLLMsResponseBody,
)
async def get_llms() -> GetLLMsResponseBody:
    """Retrieve LLMs from the database."""
    llms = []
    async for llm in llms_collection.find():
        llms.append(LLM(**llm))
    return GetLLMsResponseBody(llms=llms)
