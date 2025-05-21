const Cart = require("../Models/CartModel");

exports.addCartProduct = async (req, res) => {
  const { userId, productId, size, quantity, price } = req.body;

  try {
    // Check if the product with same size already exists in the user's cart
    const existingCartItem = await Cart.findOne({
      userId,
      productId,
      size,
      price,
    });

    if (existingCartItem) {
      // If already exists, increase quantity
      existingCartItem.quantity += quantity;
      await existingCartItem.save();
      return res
        .status(200)
        .json({ success: true, cartItem: existingCartItem });
    }

    // If not exists, create new cart item
    const newCartItem = new Cart({ userId, productId, size, quantity, price });
    await newCartItem.save();

    res.status(201).json({ success: true, message: "Cart item added successfully", cartItem: newCartItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.fetchCartProduct = async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.params.userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCartProduct = async (req, res) => {
  const { userId, productId, size, quantity } = req.body;

  try {
    const cart = await Cart.findById(req.params.id);
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    const itemIndex = cart.items.findIndex(
      (item) => item.productId === productId && item.size === size
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();
      return res.status(200).json({ success: true, cart });
    }

    return res
      .status(404)
      .json({ success: false, message: "Item not found in cart" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteCartProduct = async (req, res) => {
  const { userId, productId, size } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart)
      return res
        .status(404)
        .json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => !(item.productId === productId && item.size === size)
    );

    await cart.save();
    res.status(200).json({ success: true, cart });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAllCartProduct = async (req, res) => {
  try {
    await Cart.findOneAndDelete({ userId: req.params.userId });
    res.status(200).json({ success: true, message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
