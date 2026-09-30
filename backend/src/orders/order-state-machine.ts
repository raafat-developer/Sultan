import { OrderStatus } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

export const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.NEW]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.ASSIGNED]: [OrderStatus.COURIER_ACCEPTED, OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
  [OrderStatus.COURIER_ACCEPTED]: [OrderStatus.GOING_TO_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.GOING_TO_PICKUP]: [OrderStatus.ARRIVED_AT_PICKUP, OrderStatus.CANCELLED],
  [OrderStatus.ARRIVED_AT_PICKUP]: [OrderStatus.PICKED_UP, OrderStatus.CANCELLED],
  [OrderStatus.PICKED_UP]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.RETURN_REQUESTED, OrderStatus.FAILED_DELIVERY],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.ARRIVED_AT_CUSTOMER, OrderStatus.RETURN_REQUESTED, OrderStatus.FAILED_DELIVERY],
  [OrderStatus.ARRIVED_AT_CUSTOMER]: [OrderStatus.DELIVERED, OrderStatus.FAILED_DELIVERY, OrderStatus.RETURN_REQUESTED],
  [OrderStatus.FAILED_DELIVERY]: [OrderStatus.RETURN_REQUESTED, OrderStatus.RETURNING, OrderStatus.CANCELLED],
  [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURNING, OrderStatus.CANCELLED],
  [OrderStatus.RETURNING]: [OrderStatus.RETURNED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.RETURNED]: [],
};

export function validateStatusTransition(currentStatus: OrderStatus, nextStatus: OrderStatus): void {
  const allowed = VALID_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    throw new BadRequestException({
      code: 'INVALID_ORDER_STATUS',
      message: `Invalid order status transition from '${currentStatus}' to '${nextStatus}'. Allowed transitions: [${allowed.join(', ')}]`,
    });
  }
}
