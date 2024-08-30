using Microsoft.AspNetCore.SignalR;

namespace GridBattle.Api;

public sealed class HubFilter(ILogger<HubFilter> logger) : IHubFilter
{
    private sealed record ResponseWrapperError(string Type, string Message);

    private sealed record ResponseWrapper(object? Resource, ResponseWrapperError? Error);

    public async ValueTask<object?> InvokeMethodAsync(
        HubInvocationContext invocationContext,
        Func<HubInvocationContext, ValueTask<object?>> next
    )
    {
        logger.LogInformation("Calling hub method '{MethodName}'", invocationContext.HubMethodName);
        try
        {
            var result = await next(invocationContext);
            return new ResponseWrapper(result, null);
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Exception calling '{MethodName}'",
                invocationContext.HubMethodName
            );
            return new ResponseWrapper(null, new(ex.GetType().Name, ex.Message));
        }
    }
}
