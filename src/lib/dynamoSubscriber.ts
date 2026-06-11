import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: process.env.AWS_REGION ?? "ap-northeast-2" })
);

export const SUBSCRIBERS_TABLE = "haruboan-subscribers";

export interface SubscriberItem {
  email: string;
  audience: string;
  topics: string[];
  deliveryTime: string;
  createdAt: string;
  updatedAt: string;
}

export async function putSubscriber(item: SubscriberItem): Promise<void> {
  await ddb.send(new PutCommand({ TableName: SUBSCRIBERS_TABLE, Item: item }));
}

export async function deleteSubscriber(email: string): Promise<void> {
  await ddb.send(new DeleteCommand({ TableName: SUBSCRIBERS_TABLE, Key: { email } }));
}

export async function scanSubscribersByDeliveryTime(deliveryTime: string): Promise<SubscriberItem[]> {
  const items: SubscriberItem[] = [];
  let lastKey: Record<string, unknown> | undefined;

  do {
    const resp = await ddb.send(
      new ScanCommand({
        TableName: SUBSCRIBERS_TABLE,
        FilterExpression: "deliveryTime = :dt",
        ExpressionAttributeValues: { ":dt": deliveryTime },
        ExclusiveStartKey: lastKey,
      })
    );
    if (resp.Items) items.push(...(resp.Items as SubscriberItem[]));
    lastKey = resp.LastEvaluatedKey as Record<string, unknown> | undefined;
  } while (lastKey);

  return items;
}
