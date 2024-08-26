using Microsoft.AspNetCore.SignalR;

namespace GridBattle.Api;

public sealed class HubFilter(ILogger<HubFilter> logger) : IHubFilter
{
    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next
    )
    {
        logger.LogInformation("Calling hub method '{MethodName}'", invocationContext.HubMethodName);
        try
        {
            return await next(invocationContext);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Exception calling '{MethodName}'", invocationContext.HubMethodName);
            throw;
        }
    }
}
