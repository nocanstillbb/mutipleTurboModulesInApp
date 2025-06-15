#include <jsi/jsi.h>
#include <memory>
#include <prism/rn/prismLog.h>
#include <prism/rn/prismRnJson.hpp>
#include <signal.h>
#include <string>

#include "NativeViewModelA.h"
#include "prism/container.hpp"

namespace facebook::react
{

// NativeViewModelA constructor initializes the CxxSpec with the provided jsInvoker
NativeViewModelA::NativeViewModelA(std::shared_ptr<CallInvoker> jsInvoker) : NativeViewModelACxxSpec(std::move(jsInvoker))
{
    // raise(SIGSTOP); // 中断
    prism::Container::get()->register_instance(jsInvoker);
}

// This function returns a jsi::String that echoes the input string
jsi::String NativeViewModelA::getStr(jsi::Runtime &rt, jsi::String input)
{
    LOG_DEBUG_F(rt, this->jsInvoker_, "get string with native view model A");
    return input;
}

// This function creates a jsi::Object from a PrismModelProxy<Test> instance
jsi::Object NativeViewModelA::NativeViewModelA::getObj(jsi::Runtime &rt)
{
    if (test_->instance()->sub_list->list()->empty())
    {
        for (int i = 0; i < 9 * 9; ++i)
        {
            test_->instance()->sub_list->list()->emplace_back(std::make_shared<prism::rn::PrismModelProxy<SubClass>>(i));
        }

        std::string json1 = prism::json::toJsonString(test_);
        LOG_DEBUG_F(rt, this->jsInvoker_, "json1 : {}", json1.c_str());
        auto test_2 = prism::json::fromJsonString<prismModelProxy_Test>(json1);
        std::string json2 = prism::json::toJsonString(test_2);
        LOG_DEBUG_F(rt, this->jsInvoker_, "json2 : {}", json2.c_str());
    }

    LOG_DEBUG_F(rt, this->jsInvoker_, "get object");
    return jsi::Object::createFromHostObject(rt, test_);
}

void NativeViewModelA::printObj(jsi::Runtime &rt)
{
    std::string json1 = prism::json::toJsonString(test_);
    LOG_DEBUG_F(rt, this->jsInvoker_, "object json : {}", json1.c_str());
}

} // namespace facebook::react
