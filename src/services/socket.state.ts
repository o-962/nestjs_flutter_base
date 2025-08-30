import { Injectable } from "@nestjs/common";
import { Auth } from "@routes/auth/entities/auth.entity";

export class SocketState {
  public usersList: Record<string, Auth> = {};
  public updates: string[] = [];
  public driverOrderList : Record<string,Set<string>> = {};
  public userOrderList : Record<string,Set<string>> = {};
  public driversFastGiftList : Record<string,Set<string>> = {};
}