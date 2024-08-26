FROM --platform=$BUILDPLATFORM mcr.microsoft.com/dotnet/sdk:8.0 AS build-server

WORKDIR /source

COPY ./server/Directory.* .
COPY ./server/GridBattle.Data/GridBattle.Data.csproj GridBattle.Data/GridBattle.Data.csproj
COPY ./server/GridBattle.Data.Importer/GridBattle.Data.Importer.csproj GridBattle.Data.Importer/GridBattle.Data.Importer.csproj
RUN dotnet restore GridBattle.Data.Importer/GridBattle.Data.Importer.csproj

COPY ./server/GridBattle.Data GridBattle.Data
COPY ./server/GridBattle.Data.Importer GridBattle.Data.Importer
RUN dotnet publish GridBattle.Data.Importer/GridBattle.Data.Importer.csproj -c Release -o publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app
COPY --from=build-server /source/publish .

CMD ["tail", "-f", "/dev/null"]
