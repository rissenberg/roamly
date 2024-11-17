import { IEventResponse, IEvent } from '../../../Event';
import { IPlace, IPlaceResponse } from '../../../Place';
import { IUser, UserRole } from '../../../User';

export interface ITrip {
  id: string,
  name: string,
  users: IUser[],
  myRole: UserRole,
  startTime: Date,
  endTime: Date,
  area: IPlace,
  places: IPlace[],
  events: IEvent[],
}

export interface ITripResponse {
  id: string,
  name: string,
  users: IUser[]
  start_time: string,
  end_time: string,
  area_id: string,
  area: IPlaceResponse,
  places: IPlaceResponse[],
  events: IEventResponse[],
}
