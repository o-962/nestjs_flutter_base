// delivery-type.enum.ts
export enum DeliveryType {
  TAXI = 'taxi',
  GIFTS = 'gifts',
}

// gift-type.enum.ts
export enum GiftType {
  FAST = 'fast',
  NORMAL = 'normal',
}

// gender.enum.ts
export enum PreferredGender {
  ANY = 'any',
  MALE = 'male',
  FEMALE = 'female',
}

// order-status.enum.ts
export enum OrderStatus {
  PENDING = 'pending',               // waiting for driver to accept
  QUEUE = 'queue',             // driver has accepted , user on queue the order
  DRIVER_EN_ROUTE = 'driver_en_route', // driver is on the way to pickup
  DRIVER_ARRIVED = 'driver_arrived',   // driver reached pickup location
  IN_PROGRESS = 'in_progress',       // ride/delivery in progress
  COMPLETED = 'completed',           // order successfully finished
  CANCELLED = 'cancelled',           // order cancelled
}

export enum OrderExistence {
  NO_ORDER = 'no_order',
  PENDING = 'pending',
  EXISTS = 'exists'
}

export enum Gender {
  MALE = 'male',
  FEMALE = 'female' 
}

export enum DriverStatus {
  ONLINE  = 'online',
  OFFLINE  = 'offline',
  IN_TRIP = 'on_trip',
  SUSPENDED = 'suspended'
}

export enum SocketEvents {
  // Driver events
  DRIVER_INIT = 'driver:init',
  DRIVER_NEW_ORDER = 'driver:new_order',
  ORDER_ACCEPTED = 'order:accepted',
  ORDER_REJECTED = 'order:rejected',
  ORDER_DETAILS = 'order:details',
  ORDER_CANCELLED = 'order:cancel',
  DRIVER_UPDATE_LOCATION = 'driver:update_location',
  NEW_ORDER_STATUS = 'order:new_status',
  
  // Rider events
  
  RIDER_UPDATE_LOCATION = 'rider:update_location',
  RIDER_RIDE_STATUS = 'rider:ride-status',
  RIDER_INIT = 'rider:init',

  // System events
  AUTH_UNAUTHORIZED = 'auth:unauthorized',
  SYSTEM_ERROR = 'system:error',

  
}