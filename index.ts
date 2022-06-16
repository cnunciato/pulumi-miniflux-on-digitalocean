import * as pulumi from "@pulumi/pulumi";
import * as digitalocean from "@pulumi/digitalocean";

const config = new pulumi.Config();
const adminPassword = config.requireSecret("adminPassword");
const dbPassword = config.requireSecret("dbPassword");

const region = config.get("region") || digitalocean.Region.SFO3;

const miniflux = new digitalocean.App("app", {
    spec: {
        name: "miniflux",
        region,
        services: [
            {
                name: "miniflux",
                image: {
                    registry: "miniflux",
                    repository: "miniflux",
                    registryType: "DOCKER_HUB",
                },
                instanceSizeSlug: "basic-xxs",
                instanceCount: 1,
                routes: [
                    {
                        path: "/"
                    },
                ],
                envs: [
                    {
                        key: "DATABASE_URL",
                        scope: "RUN_AND_BUILD_TIME",
                        value: "${db.DATABASE_URL}",
                    },
                    {
                        key: "RUN_MIGRATIONS",
                        scope: "RUN_AND_BUILD_TIME",
                        value: "1",
                    },
                    {
                        key: "CREATE_ADMIN",
                        scope: "RUN_AND_BUILD_TIME",
                        value: "1",
                    },
                    {
                        key: "ADMIN_USERNAME",
                        scope: "RUN_AND_BUILD_TIME",
                        value: "admin",
                    },
                    {
                        key: "ADMIN_PASSWORD",
                        scope: "RUN_AND_BUILD_TIME",
                        value: adminPassword,
                        type: "SECRET"
                    },
                    {
                        key: "POSTGRES_USER",
                        scope: "RUN_AND_BUILD_TIME",
                        value: "miniflux",
                    },
                    {
                        key: "POSTGRES_PASSWORD",
                        scope: "RUN_AND_BUILD_TIME",
                        value: dbPassword,
                        type: "SECRET"
                    },
                ],
            },
        ],
        databases: [
            {
                name: "db",
                engine: "PG",
            },
        ],
    },
});

export const { liveUrl } = miniflux;
