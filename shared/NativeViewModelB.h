#include "ViewmodelsSpecsJSI.h"
#include <memory>

namespace facebook::react
{
class JSI_EXPORT NativeViewModelB : public NativeViewModelBCxxSpec<NativeViewModelB>
{

  public:
    NativeViewModelB(std::shared_ptr<CallInvoker> jsInvoker);
    jsi::String getStr(jsi::Runtime &rt, jsi::String input);
};

} // namespace facebook::react
// namespace facebook::react
