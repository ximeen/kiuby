import {
  DrizzleCustomerRepository,
  DrizzleProductRepository,
  DrizzleSaleRepository,
  DrizzleStockMovementRepository,
  DrizzleStockRepository,
  DrizzleUserRepository,
  DrizzleWarehouseRepository,
} from "@infrastructure/database/repositories";

let productRepository: DrizzleProductRepository;
let customerRepository: DrizzleCustomerRepository;
let warehouseRepository: DrizzleWarehouseRepository;
let userRepository: DrizzleUserRepository;
let stockRepository: DrizzleStockRepository;
let stockMovementRepository: DrizzleStockMovementRepository;
let saleRepository: DrizzleSaleRepository;

export function getProductsRepository(): DrizzleProductRepository {
  if (!productRepository) {
    productRepository = new DrizzleProductRepository();
  }
  return productRepository;
}

export function getCustomerRepository(): DrizzleCustomerRepository {
  if (!customerRepository) {
    customerRepository = new DrizzleCustomerRepository();
  }
  return customerRepository;
}

export function getWarehouseRepository(): DrizzleWarehouseRepository {
  if (!warehouseRepository) {
    warehouseRepository = new DrizzleWarehouseRepository();
  }
  return warehouseRepository;
}

export function getUserRepository(): DrizzleUserRepository {
  if (!userRepository) {
    userRepository = new DrizzleUserRepository();
  }
  return userRepository;
}

export function getStockRepository(): DrizzleStockRepository {
  if (!stockRepository) {
    stockRepository = new DrizzleStockRepository();
  }
  return stockRepository;
}

export function getStockMovementRepository(): DrizzleStockMovementRepository {
  if (!stockMovementRepository) {
    stockMovementRepository = new DrizzleStockMovementRepository();
  }
  return stockMovementRepository;
}

export function getSaleRepository(): DrizzleSaleRepository {
  if (!saleRepository) {
    saleRepository = new DrizzleSaleRepository();
  }
  return saleRepository;
}
