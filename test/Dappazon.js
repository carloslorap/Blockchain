const { expect } = require("chai");
const { ethers } = require("hardhat");

// Función de utilidad para convertir cantidades a unidades de ether
const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ID = 1;
const NAME = "Shoes";
const CATEGORY = "Clothing";
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg";
const COST = tokens(1);
const RATING = 4;
const STOCK = 5;

describe("Dappazon", () => {
  let dappazon;
  let deployer, buyer;
  
  // Configuración antes de cada prueba
  beforeEach(async () => {
    // Configurar cuentas
    [deployer, buyer] = await ethers.getSigners();

    // Desplegar el contrato
    const Dappazon = await ethers.getContractFactory("Dappazon");
    dappazon = await Dappazon.deploy();
  });

  // Pruebas relacionadas con el despliegue del contrato
  describe("Deployment", () => {
    it("Sets the owner", async () => {
      expect(await dappazon.owner()).to.equal(deployer.address);
    });
  });

  // Pruebas relacionadas con el listado de productos
  describe("Listing", () => {
    let transaction;

    beforeEach(async () => {
      // Listar un producto antes de cada prueba
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK);
      await transaction.wait();
    });

    it("Devuelve atributos del artículo", async () => {
      // Verificar que los atributos del producto sean correctos
      const item = await dappazon.items(1);
      expect(item.id).to.equal(1);
      expect(item.name).to.equal(NAME)
      expect(item.category).to.equal(CATEGORY)
      expect(item.image).to.equal(IMAGE)
      expect(item.cost).to.equal(COST)
      expect(item.rating).to.equal(RATING)
      expect(item.stock).to.equal(STOCK)
    });

    it("Emite evento de lista", () => {
      // Verificar que se emita el evento List al agregar un producto
      expect(transaction).to.emit(dappazon, "List")
    })
  });

  // Pruebas relacionadas con la compra de productos
  describe("Buying", () => {
    let transaction;

    beforeEach(async () => {
      // Listar un producto antes de cada prueba
      transaction = await dappazon
        .connect(deployer)
        .list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
        await transaction.wait()

      // Comprar un producto antes de cada prueba
      transaction = await dappazon.connect(buyer).buy(ID,{value:COST})
    });

    it("Actualiza el recuento de pedidos del comprador.", async () => {
      // Verificar que el recuento de órdenes del comprador se actualice
      const result = await dappazon.orderCount(buyer.address)
      expect(result).to.equal(1)
    })

    it("Agrega el pedido", async () => {
      // Verificar que la orden se agregue correctamente
      const order = await dappazon.orders(buyer.address, 1)

      expect(order.time).to.be.greaterThan(0)
      expect(order.item.name).to.equal(NAME)
    })

    it("Actualiza el saldo del contrato.", async () => {
      // Verificar que el balance del contrato se actualice correctamente
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(COST)
    })

    it("Emite evento de compra", () => {
      // Verificar que se emita el evento Buy al realizar una compra
      expect(transaction).to.emit(dappazon, "Buy")
    })
  });

  // Pruebas relacionadas con el retiro de fondos del contrato
  describe("Withdrawing", () => {
    let balanceBefore

    beforeEach(async () => {
      // Listar y comprar un producto antes de cada prueba
      let transaction = await dappazon.connect(deployer).list(ID, NAME, CATEGORY, IMAGE, COST, RATING, STOCK)
      await transaction.wait()

      transaction = await dappazon.connect(buyer).buy(ID, { value: COST })
      await transaction.wait()

      // Obtener el balance del propietario antes del retiro
      balanceBefore = await ethers.provider.getBalance(deployer.address)

      // Retirar fondos del contrato
      transaction = await dappazon.connect(deployer).withdraw()
      await transaction.wait()
    })

    it('Actualiza el saldo del propietario.', async () => {
      // Verificar que el balance del propietario se actualice correctamente
      const balanceAfter = await ethers.provider.getBalance(deployer.address)
      expect(balanceAfter).to.be.greaterThan(balanceBefore)
    })

    it('Actualiza el saldo del contrato.', async () => {
      // Verificar que el balance del contrato se actualice a cero después del retiro
      const result = await ethers.provider.getBalance(dappazon.address)
      expect(result).to.equal(0)
    })
  })

});