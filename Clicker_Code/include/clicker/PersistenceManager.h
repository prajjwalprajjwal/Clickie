#ifndef PERSISTENCE_MANAGER_H
#define PERSISTENCE_MANAGER_H

#include <Arduino.h>
#include <Preferences.h>
#include <stdint.h>
#include "clicker/ClickCounter.h"
#include "clicker/MilestoneTypes.h"

class PersistenceManager {
private:
    Preferences prefs;
    bool dirty = false;
    uint32_t clicksSincePersist = 0;
    uint32_t homeUnlockFlags = 0;
    uint64_t lastCycleCompleteLifetime = 0;

    bool save(const ClickCounter& counter, const uint32_t milestoneFlags[MILESTONE_FLAG_WORDS]);

public:
    bool begin();
    bool load(ClickCounter& counter, uint32_t milestoneFlags[MILESTONE_FLAG_WORDS]);
    bool flush(const ClickCounter& counter, const uint32_t milestoneFlags[MILESTONE_FLAG_WORDS]);

    void markDirty();
    void onClickRecorded();
    bool shouldPersistPeriodic() const;
    void clearPeriodicCounter();

    uint32_t getHomeUnlockFlags() const { return homeUnlockFlags; }
    void setHomeUnlockFlags(uint32_t flags) { homeUnlockFlags = flags; }

    uint64_t getLastCycleCompleteLifetime() const { return lastCycleCompleteLifetime; }
    void setLastCycleCompleteLifetime(uint64_t value) { lastCycleCompleteLifetime = value; }
};

#endif // PERSISTENCE_MANAGER_H
