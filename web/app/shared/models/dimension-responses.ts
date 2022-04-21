import { FE_Bridge, FE_Widget } from "./integration";

export interface FE_IntegrationsResponse {
    widgets: FE_Widget[];
    bridges: FE_Bridge<any>[];
}

export interface FE_SupportedIntegrationsResponse {
    Widgets: boolean;
    Bots: boolean;
    Bridges: boolean;
}