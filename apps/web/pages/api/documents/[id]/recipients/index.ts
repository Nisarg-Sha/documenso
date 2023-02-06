import {
  defaultHandler,
  defaultResponder,
  getUserFromToken,
} from "@documenso/lib/server";
import prisma from "@documenso/prisma";
import { NextApiRequest, NextApiResponse } from "next";
import short from "short-uuid";
import { Document as PrismaDocument } from "@prisma/client";
import { getDocument } from "@documenso/lib/query";

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getUserFromToken(req, res);
  const { id: documentId } = req.query;
  const body = req.body;

  if (!user) return;

  if (!documentId) {
    res.status(400).send("Missing parameter documentId.");
    return;
  }

  const document: PrismaDocument = await getDocument(+documentId, req, res);

  // todo encapsulate entity ownerships checks
  if (document.userId !== user.id) {
    return res.status(401).send("User does not have access to this document.");
  }

  const recipient = await prisma.recipient.upsert({
    where: {
      id: +body.id,
    },
    update: {
      email: body.email.toString(),
      name: body.name.toString(),
    },
    create: {
      documentId: +documentId,
      email: body.email.toString(),
      name: body.name.toString(),
      token: short.generate().toString(),
    },
  });

  return res.status(200).end(JSON.stringify(recipient));
}

export default defaultHandler({
  POST: Promise.resolve({ default: defaultResponder(postHandler) }),
});