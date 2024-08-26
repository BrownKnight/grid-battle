FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build-server

WORKDIR /source

COPY ./.git .
COPY ./version.json .
COPY ./Directory.* .
COPY ./server/Directory.* ./server/
COPY ./server/GridBattle.Data/GridBattle.Data.csproj ./server/GridBattle.Data/GridBattle.Data.csproj
COPY ./server/GridBattle.Data.Importer/GridBattle.Data.Importer.csproj ./server/GridBattle.Data.Importer/GridBattle.Data.Importer.csproj
RUN dotnet restore ./server/GridBattle.Data.Importer/GridBattle.Data.Importer.csproj

COPY . .
RUN dotnet publish ./server/GridBattle.Data.Importer/GridBattle.Data.Importer.csproj -c Release -o publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=build-server /source/publish .

CMD ["tail", "-f", "/dev/null"]
