import {Router, Request, Response, response } from "express";
import multer from "multer";
import { Readable } from "stream";
import readline from "readline";
import { prisma } from "./database";

const router = Router();
const multerConfig = multer();

interface IProduct {
  code_bar: string;
  description:string;
  price:number;
  quantity:number;
}
router.post('/products', multerConfig.single("file"), async (req:Request,res:Response) => {
  const {file} = req;

  const readableFile = new Readable();
  readableFile.push(file?.buffer);
  readableFile.push(null);

  const productLine = readline.createInterface({
    input: readableFile
  });

  const products: IProduct[] = [];

  for await(let line of productLine) {

    const productLineSplit = line.split(",");

    products.push({
      code_bar: productLineSplit[0],
      description: productLineSplit[1],
      price: Number(productLineSplit[2]),
      quantity: Number(productLineSplit[3])
    });
  }

  for await(let {code_bar, description, price, quantity} of products) {
    await prisma.product.create({
      data: {
        code_bar,
        description,
        price,
        quantity
      }
    });
  }

  return res.json(products);
});

export {router};