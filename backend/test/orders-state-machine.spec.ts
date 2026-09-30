import { OrderStatus } from '@prisma/client';
import { validateStatusTransition, VALID_TRANSITIONS } from '../src/orders/order-state-machine';
import { BadRequestException } from '@nestjs/common';

describe('Order State Machine', () => {
  it('should allow valid transition from NEW to ASSIGNED', () => {
    expect(() => validateStatusTransition(OrderStatus.NEW, OrderStatus.ASSIGNED)).not.toThrow();
  });

  it('should allow transition from ASSIGNED to COURIER_ACCEPTED', () => {
    expect(() =>
      validateStatusTransition(OrderStatus.ASSIGNED, OrderStatus.COURIER_ACCEPTED),
    ).not.toThrow();
  });

  it('should allow transition from COURIER_ACCEPTED to GOING_TO_PICKUP', () => {
    expect(() =>
      validateStatusTransition(OrderStatus.COURIER_ACCEPTED, OrderStatus.GOING_TO_PICKUP),
    ).not.toThrow();
  });

  it('should allow transition from ARRIVED_AT_CUSTOMER to DELIVERED', () => {
    expect(() =>
      validateStatusTransition(OrderStatus.ARRIVED_AT_CUSTOMER, OrderStatus.DELIVERED),
    ).not.toThrow();
  });

  it('should reject invalid transition from NEW directly to DELIVERED', () => {
    expect(() =>
      validateStatusTransition(OrderStatus.NEW, OrderStatus.DELIVERED),
    ).toThrow(BadRequestException);
  });

  it('should reject transition out of terminal state DELIVERED', () => {
    expect(() =>
      validateStatusTransition(OrderStatus.DELIVERED, OrderStatus.NEW),
    ).toThrow(BadRequestException);
  });

  it('should reject transition out of terminal state CANCELLED', () => {
    expect(() =>
      validateStatusTransition(OrderStatus.CANCELLED, OrderStatus.ASSIGNED),
    ).toThrow(BadRequestException);
  });
});
