#include "NativeViewModelB.h"
#include <prism/rn/prismLog.h>

namespace facebook::react
{

NativeViewModelB::NativeViewModelB(std::shared_ptr<CallInvoker> jsInvoker)
    : NativeViewModelBCxxSpec(std::move(jsInvoker))
{
}

jsi::String NativeViewModelB::getStr(jsi::Runtime &rt, jsi::String input)
{
    LOG_INFO_F(rt, this->jsInvoker_, "get string with native view model B");
    return input;
}

} // namespace facebook::react
