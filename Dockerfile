FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build-server

WORKDIR /source

COPY ./.git .
COPY ./version.json .
COPY ./Directory.* .
COPY ./server/Directory.* ./server/
COPY ./server/GridBattle.Data/GridBattle.Data.csproj ./server/GridBattle.Data/GridBattle.Data.csproj
COPY ./server/GridBattle.Api/GridBattle.Api.csproj ./server/GridBattle.Api/GridBattle.Api.csproj
RUN dotnet restore ./server/GridBattle.Api/GridBattle.Api.csproj

COPY ./server ./server/
RUN dotnet publish ./server/GridBattle.Api/GridBattle.Api.csproj -c Release -o publish

FROM node:20 AS build-ui

WORKDIR /source

COPY ./ui/package.json package.json
COPY ./ui/package-lock.json package-lock.json
RUN npm install
COPY ui .
RUN npm run build

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=build-server /source/publish .
COPY --from=build-ui /source/dist wwwroot

ENTRYPOINT ["dotnet", "GridBattle.Api.dll"]