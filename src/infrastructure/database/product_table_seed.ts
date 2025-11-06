import { faker } from "@faker-js/faker";

export const productsSeeds = [
  {
    name: "Notebook Dell Inspiron",
    description: "Notebook i5 8GB RAM 256GB SSD",
    sku: "NB-DELL-001",
    price: 3499.9,
    costPrice: 2800.0,
    minStockLevel: 5,
    maxStockLevel: 50,
    unit: "UN",
  },
  {
    name: "Mouse Logitech MX Master",
    description: "Mouse wireless ergonômico",
    sku: "MS-LOG-002",
    price: 449.9,
    costPrice: 350.0,
    minStockLevel: 10,
    maxStockLevel: 100,
    unit: "UN",
  },
  {
    name: "Teclado Mecânico Keychron",
    sku: "KB-KEY-003",
    price: 599.9,
    costPrice: 480.0,
    minStockLevel: 8,
    unit: "UN",
  },
  {
    name: "Monitor LG 27 UltraWide",
    description: "Monitor 27 polegadas IPS 75Hz",
    sku: "MN-LG-004",
    price: 1899.0,
    costPrice: 1500.0,
    minStockLevel: 3,
    maxStockLevel: 30,
    unit: "UN",
  },
  {
    name: "Webcam Logitech C920",
    sku: "WC-LOG-005",
    price: 389.9,
    minStockLevel: 15,
    unit: "UN",
  },
  {
    name: "Headset HyperX Cloud",
    description: "Headset gamer com microfone",
    sku: "HS-HYP-006",
    price: 299.9,
    costPrice: 220.0,
    minStockLevel: 12,
    maxStockLevel: 80,
    unit: "UN",
  },
  {
    name: "SSD Kingston 1TB",
    description: "SSD NVMe M.2 leitura 3500MB/s",
    sku: "SSD-KNG-007",
    price: 489.9,
    costPrice: 380.0,
    minStockLevel: 20,
    unit: "UN",
  },
  {
    name: "Cabo HDMI 2.0",
    sku: "CB-HDMI-008",
    price: 29.9,
    costPrice: 15.0,
    minStockLevel: 50,
    maxStockLevel: 200,
    unit: "UN",
  },
  {
    name: "Hub USB-C 7 em 1",
    description: "Hub com HDMI, USB 3.0 e leitor SD",
    sku: "HUB-USB-009",
    price: 149.9,
    minStockLevel: 10,
    unit: "UN",
  },
  {
    name: "Mousepad Gamer RGB",
    sku: "MP-RGB-010",
    price: 79.9,
    costPrice: 45.0,
    minStockLevel: 25,
    maxStockLevel: 150,
    unit: "UN",
  },
];

// Função para gerar produtos aleatórios (opcional)
export const generateRandomProducts = (count: number = 50) => {
  const categories = ["Eletrônicos", "Periféricos", "Acessórios", "Componentes"];
  const units = ["UN", "CX", "KG", "MT"];

  return Array.from({ length: count }, (_, i) => {
    const price = faker.number.float({ min: 10, max: 5000, precision: 0.01 });
    const costPrice = price * faker.number.float({ min: 0.5, max: 0.8, precision: 0.01 });

    return {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      sku: `SKU-${faker.string.alphanumeric(8).toUpperCase()}`,
      price,
      costPrice,
      minStockLevel: faker.number.int({ min: 5, max: 50 }),
      maxStockLevel: faker.number.int({ min: 51, max: 500 }),
      unit: faker.helpers.arrayElement(units),
    };
  });
};

async function runSeedViaHTTP() {
  const BASE_URL = process.env.API_URL || "http://localhost:3000";

  console.log("🌱 Iniciando seed de produtos via HTTP...\n");

  try {
    for (const [index, product] of productsSeeds.entries()) {
      const response = await fetch(`${BASE_URL}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(
          `✅ [${index + 1}/${productsSeeds.length}] ${product.name} - ID: ${data.id || "criado"}`,
        );
      } else {
        const error = await response.text();
        console.log(`❌ [${index + 1}/${productsSeeds.length}] ${product.name} - Erro: ${error}`);
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("\n🎉 Seed concluído! Total:", productsSeeds.length);
  } catch (error) {
    console.error("💥 Erro ao executar seed:", error);
    process.exit(1);
  }
}

async function runSeedDirect() {
  console.log("🌱 Seed direto no banco não implementado");
  console.log("💡 Importe seu repository aqui e insira direto");
}

const args = process.argv.slice(2);
const useDirect = args.includes("--direct");

if (import.meta.url === `file://${process.argv[1]}`) {
  if (useDirect) {
    runSeedDirect();
  } else {
    runSeedViaHTTP();
  }
}
