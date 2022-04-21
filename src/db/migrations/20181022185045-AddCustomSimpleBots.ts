import { LogService } from "matrix-bot-sdk";
import { QueryInterface } from "sequelize";
import { DataType } from "sequelize-typescript";
import * as randomString from "random-string";
import config from "../../config";

export default {
    up: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.createTable("dimension_custom_simple_bots", {
                "id": {type: DataType.INTEGER, primaryKey: true, autoIncrement: true, allowNull: false},
                "type": {type: DataType.STRING, allowNull: false},
                "name": {type: DataType.STRING, allowNull: false},
                "avatarUrl": {type: DataType.STRING, allowNull: false},
                "description": {type: DataType.STRING, allowNull: false},
                "isEnabled": {type: DataType.BOOLEAN, allowNull: false},
                "isPublic": {type: DataType.BOOLEAN, allowNull: false},
                "userId": {type: DataType.STRING, allowNull: false},
                "accessToken": {type: DataType.STRING, allowNull: false},
            }))
            .then(() => {
                if(config.defaultState.Bots.bots && config.defaultState.Bots.bots.length > 0) {
                    for(let {UserId, Description, name, AvatarURL, AccessToken, isPublic, isEnabled} of config.defaultState.Bots.bots) {
                        LogService.info("AddCustomSimpleBots", "name is ", name);
                        LogService.info("AddCustomSimpleBots", "avatarUrl is ", AvatarURL);
                        queryInterface.bulkInsert("dimension_custom_simple_bots", [
                            {
                                type: `${"custom_"}${randomString({length: 32})}`,
                                name: name,
                                avatarUrl: AvatarURL,
                                userId: UserId,
                                accessToken: AccessToken,
                                description: Description,
                                isEnabled: isEnabled,
                                isPublic: isPublic,
                            },
                        ])}
                    }
                }
            );
    },
    down: (queryInterface: QueryInterface) => {
        return Promise.resolve()
            .then(() => queryInterface.dropTable("dimension_custom_simple_bots"));
    }
}