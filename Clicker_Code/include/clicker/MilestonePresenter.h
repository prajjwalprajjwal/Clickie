#ifndef MILESTONE_PRESENTER_H
#define MILESTONE_PRESENTER_H

#include <Arduino.h>
#include <stdint.h>
#include "clicker/MilestoneTypes.h"

class MilestonePresenter {
private:
    static const uint32_t SCREEN_HOLD_MS = 3000;

    bool active = false;
    MilestoneEventInfo info = {};
    uint32_t stepStartMs = 0;

    bool stepElapsed(uint32_t nowMs, uint32_t durationMs) const;

public:
    void start(const MilestoneEventInfo& eventInfo);
    void update(uint32_t nowMs);
    void draw(uint32_t nowMs);

    bool isActive() const { return active; }
    void cancel();
};

#endif // MILESTONE_PRESENTER_H
