import { describe, it, expect } from "@jest/globals";

import { randomUUID } from "crypto";
import { faker } from "@faker-js/faker";
import { MongoDbAccess } from ".";

interface DataExample {
  id: string;
  name: string;
  age: number;
}

const createdData: Map<string, DataExample> = new Map();

function createRandomData(key: string): DataExample {
  if (!createdData.has(key)) {
    createdData.set(key, {
      id: randomUUID(),
      name: faker.name.firstName(),
      age: Math.round(Math.random() * 45),
    });
  }
  return createdData.get(key) as DataExample;
}

async function wait(time: number) {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, time * 1000);
  });
}

describe("Mongo", () => {
  it("should add item without pass id and need to create one", async () => {
    const x = createRandomData("x");
    const instance = await MongoDbAccess.getInstance("test_a");
    const insertResultX = await instance.insert({ name: x.name });
    expect(insertResultX.id).not.toBe(null);
  }, 5000);
  it("should add itens on first collection", async () => {
    const a = createRandomData("a");
    const b = createRandomData("b");
    const instance = await MongoDbAccess.getInstance("test_a");
    const insertResultA = await instance.insert(a);
    expect(insertResultA.id).toBe(a.id);
    const insertResultB = await instance.insert(b);
    expect(insertResultB.id).toBe(b.id);
  }, 5000);
  it("should find by id", async () => {
    const b = createRandomData("b");
    const instance = await MongoDbAccess.getInstance("test_a");
    const bById = await instance.getById<DataExample>(b.id);
    expect(bById?.id).toBe(b.id);
  }, 50000);
  it("should find saved itens", async () => {
    const a = createRandomData("a");
    const instance = await MongoDbAccess.getInstance("test_a");
    const findResult = await instance.find<DataExample>({
      filter: {
        id: a.id,
        name: a.name,
      },
    });
    expect(findResult.total).toBeGreaterThan(0);
    expect(findResult.list[0].id).toBe(a.id);
  });
  it("should find itens without filter", async () => {
    const a = createRandomData("a");
    const instance = await MongoDbAccess.getInstance("test_a");
    const findResult = await instance.find<DataExample>({});
    expect(findResult.total).toBeGreaterThan(1);
  });
  it("should update Data using same id", async () => {
    const a = createRandomData("a");
    a.name = "Name changed";
    const instance = await MongoDbAccess.getInstance("test_a");
    const insertResult = await instance.insert(a);
    const aById = await instance.getById<DataExample>(a.id);
    expect(aById?.name).toBe(a.name);
  });
});