// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Dappazon {
    // 1. Declaración de variables
    address public owner;

    // 2. Estructura que representa un producto
    struct Item {
        uint256 id;
        string name;
        string category;
        string image;
        uint256 cost;
        uint256 rating;
        uint256 stock; 
    }

    // 3. Estructura que representa una orden de compra
    struct Order {
        uint256 time;
        Item item;
    }

    // 4. Mappings para almacenar productos y órdenes
    mapping(uint256 => Item) public items;
    mapping(address => uint256) public orderCount;
    mapping(address => mapping(uint256 => Order)) public orders;

    // 5. Eventos que se emiten al realizar acciones específicas
    event Buy(address buyer, uint256 orderId, uint256 itemId);
    event List(string name, 
uint256 cost, uint256 quantity);
    // 6. Modificador que restringe ciertas funciones solo al propietario
    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // 7. Constructor: Establece al creador del contrato como propietario
    constructor() {
        owner = msg.sender;
    }

    // 8. Función para que el propietario liste productos en la tienda
    function list(
        uint256 _id,
        string memory _name,
        string memory _category,
        string memory _image,
        uint256 _cost,
        uint256 _rating,
        uint256 _stock
    ) public onlyOwner {
        // 9. Crear estructura Item con los datos proporcionados
        Item memory item = Item(
            _id,
            _name,
            _category,
            _image,
            _cost,
            _rating,
            _stock
        );
        // 10. Almacenar la estructura Item en el mapping items
        items[_id] = item;

        // 11. Emitir el evento List para indicar la adición de un producto
        emit List(_name, _cost, _stock);
    }

    // 12. Función para que los usuarios compren productos
    function buy(uint256 _id) public payable {
        // 13. Obtener el producto correspondiente al ID
        Item memory item = items[_id];

        // 14. Requerir suficientes ethers para comprar el producto
        require(msg.value >= item.cost);

        // 15. Requerir que el producto esté en stock
        require(item.stock > 0);

        // 16. Crear una orden con la información del producto y la marca de tiempo
        Order memory order = Order(block.timestamp, item);

        // 17. Incrementar el contador de órdenes del comprador
        orderCount[msg.sender]++;

        // 18. Almacenar la orden en el mapping orders
        orders[msg.sender][orderCount[msg.sender]] = order;

        // 19. Reducir el stock del producto
        items[_id].stock = item.stock - 1;
 
        // 20. Emitir el evento Buy para indicar la compra del producto
        emit Buy(msg.sender, orderCount[msg.sender], item.id);
    }

    // 21. Función para que el propietario retire los fondos acumulados en el contrato
    function withdraw() public onlyOwner {
        // 22. Transferir los fondos al propietario
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success);
    }
}