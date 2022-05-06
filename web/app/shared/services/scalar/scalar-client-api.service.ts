import { Injectable } from "@angular/core";
import * as randomString from "random-string";
import {
    CanSendEventResponse,
    JoinRuleStateResponse,
    MembershipStateResponse,
    RoomEncryptionStatusResponse,
    ScalarSuccessResponse,
    ScalarWidget,
    SetPowerLevelResponse,
    WidgetsResponse
} from "../../models/server-client-responses";
import { EditableWidget } from "../../models/widget";

@Injectable()
export class ScalarClientApiService {

    private static actionMap: { [key: string]: { resolve: (obj: any) => void, reject: (obj: any) => void, timestamp:number } } = {};

    public static getAndRemoveActionHandler(requestKey: string, hasResponse=false): { resolve: (obj: any) => void, reject: (obj: any) => void, timestamp: number } {
        console.log("===== hasResponse ", hasResponse);
        const handler = ScalarClientApiService.actionMap[requestKey];
        if(hasResponse) {
            ScalarClientApiService.actionMap[requestKey] = null;
        }
        for(const item in ScalarClientApiService.actionMap) {
            console.log("-------item ", ScalarClientApiService.actionMap[item]);
            if(ScalarClientApiService.actionMap[item] && ScalarClientApiService.actionMap[item].timestamp - new Date().getMilliseconds() > 3 * 60 * 1000) {
                ScalarClientApiService.actionMap[item] = null;
            }
        }
        return handler;
    }

    constructor() {
    }

    public inviteUser(roomId: string, userId): Promise<ScalarSuccessResponse> {
        return this.callAction("invite", {
            room_id: roomId,
            user_id: userId
        });
    }

    public getMembershipState(roomId: string, userId: string): Promise<MembershipStateResponse> {
        return this.callAction("membership_state", {
            room_id: roomId,
            user_id: userId
        });
    }

    public getJoinRule(roomId: string): Promise<JoinRuleStateResponse> {
        return this.callAction("join_rules_state", {
            room_id: roomId
        });
    }

    public getWidgets(roomId?: string): Promise<WidgetsResponse> {
        return this.callAction("get_widgets", {
            room_id: roomId
        });
    }

    public setWidget(roomId: string, widget: EditableWidget): Promise<ScalarSuccessResponse> {
        return this.callAction("set_widget", {
            room_id: roomId,
            widget_id: widget.id,
            type: widget.type,
            url: widget.url,
            name: widget.name,
            data: widget.data
        });
    }

    public setUserWidget(widget: EditableWidget): Promise<ScalarSuccessResponse> {
        return this.callAction("set_widget", {
            userWidget: true,
            widget_id: widget.id,
            type: widget.type,
            url: widget.url,
            name: widget.name,
            data: widget.data
        });
    }

    public deleteWidget(roomId: string, widget: EditableWidget | ScalarWidget): Promise<ScalarSuccessResponse> {
        const anyWidget: any = widget;
        return this.callAction("set_widget", {
            room_id: roomId,
            widget_id: anyWidget.id || anyWidget.state_key,
            type: widget.type, // required for some reason
            url: ""
        });
    }

    public deleteUserWidget(widget: EditableWidget | ScalarWidget): Promise<ScalarSuccessResponse> {
        const anyWidget: any = widget;
        return this.callAction("set_widget", {
            userWidget: true,
            widget_id: anyWidget.id || anyWidget.state_key,
            type: widget.type, // required for some reason
            url: ""
        });
    }

    public close(): void {
        this.callAction("close_scalar", {});
    }

    public canSendEvent(roomId: string, eventType: string, isState: boolean): Promise<CanSendEventResponse> {
        return this.callAction("can_send_event", {
            room_id: roomId,
            event_type: eventType,
            is_state: isState,
        });
    }

    public isRoomEncrypted(roomId: string): Promise<RoomEncryptionStatusResponse> {
        return this.callAction("get_room_enc_state", {
            room_id: roomId,
        });
    }

    public setUserPowerLevel(roomId: string, userId: string, powerLevel: number): Promise<SetPowerLevelResponse> {
        return this.callAction("set_bot_power", {
            room_id: roomId,
            user_id: userId,
            level: powerLevel,
        });
    }

    private callAction(action, payload): Promise<any> {
        const requestKey = randomString({length: 20});
        const requestTime = new Date().getMilliseconds();
        return new Promise((resolve, reject) => {
            if (!window.opener) {
                // Mimic an error response from scalar
                reject({response: {error: {message: "No window.opener", _error: new Error("No window.opener")}}});
                return;
            }

            ScalarClientApiService.actionMap[requestKey] = {
                resolve: resolve,
                reject: reject,
                timestamp: requestTime,
            };

            const request = JSON.parse(JSON.stringify(payload));
            request["request_id"] = requestKey;
            request["action"] = action;

            window.opener.postMessage(request, "*");
        });
    }
}

// Register the event listener here to ensure it gets created
window.addEventListener("message", event => {
    console.log("[yiqia-web] scalar-client-api listener event", event);
    // if(event.data.action !== "can_send_event") {
    //     window.alert("[yiqia-web] scalar-client-api listener event" + JSON.stringify(event.data))
    // }
    if (!event.data) return;

    const requestKey = event.data["request_id"];
    if (!requestKey) return;

    const action = ScalarClientApiService.getAndRemoveActionHandler(requestKey, !!event.data.response);
    if (!action) return;

    if (event.data.response && event.data.response.error) action.reject(event.data);
    else action.resolve(event.data);
});
