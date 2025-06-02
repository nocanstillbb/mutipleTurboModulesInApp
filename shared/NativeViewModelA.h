#include "ViewmodelsSpecsJSI.h"
#include "jsi/jsi.h"
#include <memory>
#include <string>

#include <prism/prismJson.hpp>
#include <prism/rn/prismmodellistproxy.hpp>
#include <prism/rn/prismmodelproxy.hpp>

struct SubClass
{
    int subint = 123;
    std::string substr = "subclass";
};
PRISM_FIELDS(SubClass, subint, substr);

using prismModelListProxySubClass = prism::rn::PrismModelListProxy<SubClass>;

struct Test
{
    int myint = 1133;
    double mydouble = 3.1415926;
    std::shared_ptr<prism::rn::PrismModelProxy<SubClass>> sub = std::make_shared<prism::rn::PrismModelProxy<SubClass>>();

    std::shared_ptr<prismModelListProxySubClass> sub_list = std::make_shared<prismModelListProxySubClass>();
};

PRISM_FIELDS(Test, myint, mydouble, sub, sub_list);

using prismModelProxy_Test = prism::rn::PrismModelProxy<Test>;

namespace facebook::react
{

class JSI_EXPORT NativeViewModelA : public NativeViewModelACxxSpec<NativeViewModelA>
{

  public:
    NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker);
    jsi::String getStr(jsi::Runtime &rt, jsi::String input);
    jsi::Object getObj(jsi::Runtime &rt);
    void printObj(jsi::Runtime &rt);

  private:
    std::shared_ptr<prismModelProxy_Test> test_ = std::make_shared<prismModelProxy_Test>();
};

} // namespace facebook::react
// namespace facebook::react
