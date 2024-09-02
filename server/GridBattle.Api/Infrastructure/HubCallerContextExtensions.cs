using Microsoft.AspNetCore.SignalR;

namespace GridBattle.Api;

public static class HubCallerContextExtensions
{
    private const string USERNAME = "USERNAME";
    private const string ROOM_ID = "ROOM_ID";

    public static string? GetUsername(this HubCallerContext context) =>
        context.Items[USERNAME]?.ToString();

    public static string? GetRoomId(this HubCallerContext context) =>
        context.Items[ROOM_ID]?.ToString();

    public static void RemoveUsername(this HubCallerContext context) =>
        context.Items.Remove(USERNAME);

    public static void RemoveRoomId(this HubCallerContext context) => context.Items.Remove(ROOM_ID);

    public static void SetUsername(this HubCallerContext context, string username) =>
        context.Items[USERNAME] = username;

    public static void SetRoomId(this HubCallerContext context, string roomId) =>
        context.Items[ROOM_ID] = roomId;
}
