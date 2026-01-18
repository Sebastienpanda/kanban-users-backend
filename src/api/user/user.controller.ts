import { Controller, Get, HttpCode, HttpStatus, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { UserService, UserData } from "./user.service";
import { AuthGuard } from "../../auth.guard";
import { AccessToken } from "../../access-token.decorator";

@ApiTags("user")
@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get("me")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Récupère toutes les données de l'utilisateur connecté" })
    @ApiResponse({
        status: 200,
        description: "Données de l'utilisateur avec tous ses workspaces, statuts, colonnes et tâches",
    })
    getMe(@AccessToken() userId: string): Promise<UserData> {
        return this.userService.getAllData(userId);
    }
}
