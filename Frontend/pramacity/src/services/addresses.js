// src/services/addresses.js
const ADDRESSES_KEY = "demo_addresses";

function readAddresses() {
  try {
    return JSON.parse(localStorage.getItem(ADDRESSES_KEY)) || [];
  } catch {
    return [];
  }
}

function writeAddresses(addresses) {
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
}

export function getAddressesByUser(userId) {
  return readAddresses()
    .filter((addr) => addr.userId === userId)
    .sort((a, b) => {
      // Địa chỉ mặc định lên đầu
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;
      // Sau đó sắp xếp theo thời gian tạo mới nhất
      return b.createdAt - a.createdAt;
    });
}

export function getAddressById(id) {
  return readAddresses().find((addr) => addr.id === id) || null;
}

export function addAddress(addressData) {
  const addresses = readAddresses();
  
  // Nếu đây là địa chỉ mặc định, bỏ mặc định của các địa chỉ khác cùng user
  if (addressData.isDefault) {
    addresses.forEach((addr) => {
      if (addr.userId === addressData.userId && addr.id !== addressData.id) {
        addr.isDefault = false;
      }
    });
  }
  
  const newAddress = {
    id: Date.now(),
    ...addressData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  addresses.push(newAddress);
  writeAddresses(addresses);
  return newAddress;
}

export function updateAddress(id, updates) {
  const addresses = readAddresses();
  const idx = addresses.findIndex((addr) => addr.id === id);
  
  if (idx === -1) throw new Error("Không tìm thấy địa chỉ");
  
  // Nếu đặt làm mặc định, bỏ mặc định của các địa chỉ khác cùng user
  if (updates.isDefault) {
    const currentAddress = addresses[idx];
    addresses.forEach((addr) => {
      if (
        addr.userId === currentAddress.userId &&
        addr.id !== id &&
        addr.isDefault
      ) {
        addr.isDefault = false;
      }
    });
  }
  
  addresses[idx] = {
    ...addresses[idx],
    ...updates,
    updatedAt: Date.now(),
  };
  
  writeAddresses(addresses);
  return addresses[idx];
}

export function deleteAddress(id) {
  const addresses = readAddresses();
  const filtered = addresses.filter((addr) => addr.id !== id);
  writeAddresses(filtered);
  return true;
}

export function setDefaultAddress(id, userId) {
  const addresses = readAddresses();
  
  // Bỏ mặc định của tất cả địa chỉ cùng user
  addresses.forEach((addr) => {
    if (addr.userId === userId) {
      addr.isDefault = addr.id === id;
    }
  });
  
  writeAddresses(addresses);
  return true;
}

