import { SetMetadata, UseGuards, applyDecorators } from "@nestjs/common";
import { JwtAuthGuard } from "../auth.guard";

export const REQUIRE_SUPER_ADMIN_KEY = "requireSuperAdmin";

export const RequireSuperAdmin = () => {
  return applyDecorators(SetMetadata(REQUIRE_SUPER_ADMIN_KEY, true), UseGuards(JwtAuthGuard));
};

