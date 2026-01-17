import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, JWTPayload, jwtVerify } from "jose";

interface CustomJwtPayload extends JWTPayload {
    sub?: string;
    id?: string;
    email?: string;
    [key: string]: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
    private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

    constructor(private readonly configService: ConfigService) {
        const jwksUrl = this.configService.getOrThrow<string>("JWKS_URL");
        this.jwks = createRemoteJWKSet(new URL(jwksUrl));
        console.log("[AuthGuard] JWKS configuré:", jwksUrl);
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const authHeader = request.headers.authorization;

        if (!authHeader) {
            throw new UnauthorizedException("Token manquant");
        }

        const [type, token] = authHeader.split(" ");

        if (type !== "Bearer" || !token) {
            throw new UnauthorizedException("Format de token invalide");
        }

        try {
            const { payload } = await jwtVerify(token, this.jwks, {
                algorithms: ["EdDSA"],
            });

            const typedPayload = payload as CustomJwtPayload;

            const userId = typedPayload.sub || typedPayload.id;

            if (!userId) {
                throw new UnauthorizedException("User ID introuvable");
            }

            console.log("[AuthGuard] User ID:", userId);
            console.log("[AuthGuard] Token vérifié avec JWKS");

            request.userId = userId;
            request.user = typedPayload;
            request.accessToken = token;

            return true;
        } catch (error: unknown) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            if (error instanceof Error) {
                console.error("[AuthGuard] Error:", error.message);

                if (error.message.includes("expired")) {
                    throw new UnauthorizedException("Token expiré");
                }

                if (error.message.includes("signature")) {
                    throw new UnauthorizedException("Signature invalide");
                }
            }

            throw new UnauthorizedException("Token invalide");
        }
    }
}
