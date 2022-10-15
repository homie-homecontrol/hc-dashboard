import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { getSelector, isExtendedPropertyMapping, PageMenu, PropertyMapping } from '../models/dash.model';
import { HomieValuesTypes, PropertySelector } from 'node-homie/model';
import { asPropertyPointer, mapValueOut } from 'node-homie/util';
import { InfluxDBQuery, InfluxDbResult, IRestDashboardPage } from '../models/api.model';

@Injectable({
  providedIn: 'root'
})
export class APIService {
  constructor(private http: HttpClient) { }

  getMenu(): Observable<PageMenu> {
    return this.http.get<PageMenu>('/api/v1/dashconfig');
  }

  getPageDef(pageId: string): Observable<IRestDashboardPage> {
    return this.http.get<IRestDashboardPage>(`/api/v1/dashconfig/${pageId}`);
  }

  setProperty(selector: PropertyMapping | null | undefined, value: HomieValuesTypes): Observable<{ result: boolean }> {
    if (selector === null || selector === undefined) { return of({ result: false }); }


    const mappedValue = isExtendedPropertyMapping(selector) ? mapValueOut(value, selector.mapping) : value; 

    console.log(`Setting property ${asPropertyPointer(getSelector(selector))} to ${JSON.stringify({ value })} --> ${JSON.stringify({ mappedValue })}`);
    return this.http.put<{ result: boolean }>(`/api/v1/homie/${asPropertyPointer(getSelector(selector))}`, { value: mappedValue });
  }

  queryInfluxDB(query: InfluxDBQuery): Observable<InfluxDbResult> {
    return this.http.put<InfluxDbResult>(`/api/v1/influxdb/query`, query)
  }


}


