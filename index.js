const { chromium } = require("playwright");
const { Parser } = require("json2csv");
const fs = require("fs");

const defaultTimeOut = 1000;
const cookiesSelector = "#axeptio_btn_acceptAll";
const productCardSelector = ".product-item-info";
const productNameSelector = ".product-item-link";
const imageSelector = ".product-image-photo";
const priceSelector = ".price";

const main = async () => {
  let productList = [];
  const browser = await chromium.launch({});
  let productNumber = 0;
  const page = await browser.newPage();
  let pageNumber = 1;
  do {
    // OU CAS OU IL YA PLUS DE 60 PRODUITS
    await page.goto(`https://www.bonhommedebois.com/nos-univers-de-jouets/naissance.html?mr_filter_marques=5737product_list_limit%3D60&p=${pageNumber}&product_list_limit=60`);
    await page.waitForTimeout(defaultTimeOut);
    if (pageNumber === 1) {
      await page.locator(cookiesSelector).click();
    }
    await page.waitForTimeout(defaultTimeOut);
    const cards = await page.$$(productCardSelector);
    productNumber = cards.length;
    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      // L'IMAGE EST EN LAZY LOAD DONC IL FAUT ALLER A L'ELEMENT AVEC 100ms D'ATTENTE POUR S'ASSURER QUE L'IMAGE S'EST BIEN CHARGEE
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(100);
      const nameElement = await card.$(productNameSelector);
      const productImage = await card.$eval(imageSelector, (hel) => hel.src);
      const priceElement = await card.$(priceSelector);
      const productName = await nameElement.innerText();
      const productPrice = await priceElement.innerText();
      productList = [...productList, { name: productName, price: productPrice, image: productImage }];
    }
    pageNumber++;
  } while (productNumber === 60);
  await browser.close();
  return productList;
};

const run = async () => {
  const productList = await main();
  const jsonParser = new Parser();
  const csv = jsonParser.parse(productList);
  fs.writeFile("output.csv", csv, "utf8", function (err) {
    if (err) {
      throw "Erreur survenue, veuillez vérifier votre connexion et réessayer";
    } else {
      console.log(`Extraction de ${productList.length} produits Terminée`);
    }
  });
};

run();
