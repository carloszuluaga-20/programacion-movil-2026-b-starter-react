// Kotlin exercise — Product catalog.
// Run this file in https://play.kotlinlang.org.
// No Android project is required.

/**
 * The id identifies the product and does not change.
 * Editable catalog fields use var.
 * Nullable stock represents missing stock information.
 */
class Product(
    val id: Int,
    var name: String,
    var price: Double,
    var category: String,
    var stock: Int? = null
)

/** Returns a stock label while safely handling null. */
fun stockLabel(stock: Int?): String {
    if (stock == null) {
        return "Sin dato"
    }

    return when {
        stock == 0 -> "Agotado"
        stock < 5 -> "Pocas unidades"
        else -> "Disponible"
    }
}

/** Returns the discounted price without changing the original price. */
fun applyDiscount(price: Double, percent: Int): Double {
    return price * (1 - percent / 100.0)
}

fun main() {
    val products = listOf(
        Product(1, "Mineral water", 1800.0, "Bebidas", null),
        Product(2, "Oat cookies", 2700.0, "Snacks", 0),
        Product(3, "Hand soap", 6900.0, "Aseo", 3)
    )

    for (product in products) {
        val discountedPrice = applyDiscount(product.price, 10)

        println(
            "${product.name} | " +
            "Stock: ${stockLabel(product.stock)} | " +
            "Price with 10% discount: $discountedPrice COP"
        )
    }
}