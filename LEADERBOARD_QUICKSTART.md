# Leaderboard Event Hooks - Quick Start Guide

## Current Status

✅ **Feature Branch Created**: `feature/leaderboard-event-hooks-47`

### What Has Been Implemented

The foundation for the event-driven leaderboard system is complete and ready for testing:

#### 1. **Domain Events** ✅
- `BetPlacedEvent`: Emitted when users place bets
- `BetSettledEvent`: Emitted when bets are resolved (win/loss)
- `StakeCreditedEvent`: Emitted when staking rewards are credited
- `StakeDebitedEvent`: Emitted when staking debits occur

#### 2. **Leaderboard Entity** ✅
- Atomic stats tracking with proper indexes
- Betting metrics: total bets, wins, losses, accuracy, winning streak
- Staking metrics: total staked, rewards, active stakes
- Activity tracking timestamps

#### 3. **Event Handlers** ✅
- Four event handlers for all domain events
- Transaction-aware with atomic database operations
- Pessimistic locking to prevent race conditions
- Proper error handling and rollback

#### 4. **Services** ✅
- LeaderboardService with atomic update methods
- BetsService updated to emit events
- StakingService updated to emit events
- All modules integrated with AppModule

#### 5. **API Endpoints** ✅
- `GET /leaderboards/users/:userId` - Get user stats
- `GET /leaderboards/top` - Get top performers

### Branch Contents

```
src/
├── leaderboard/
│   ├── domain/events/
│   │   ├── bet-placed.event.ts
│   │   ├── bet-settled.event.ts
│   │   ├── stake-credited.event.ts
│   │   ├── stake-debited.event.ts
│   │   └── index.ts
│   ├── entities/
│   │   └── leaderboard.entity.ts
│   ├── listeners/
│   │   ├── bet-placed.listener.ts
│   │   ├── bet-settled.listener.ts
│   │   ├── stake-credited.listener.ts
│   │   ├── stake-debited.listener.ts
│   │   └── index.ts
│   ├── leaderboard.controller.ts
│   ├── leaderboard.module.ts
│   └── leaderboard.service.ts
├── bets/
│   ├── bets.service.ts (updated)
│   └── bets.module.ts (updated)
├── staking/
│   ├── staking.service.ts (updated)
│   └── staking.module.ts (created)
└── app.module.ts (updated)

Documentation:
└── LEADERBOARD_IMPLEMENTATION.md
```

## Next Steps

### 1. **Database Migration** (Required Before Testing)

Create a migration file to add the leaderboards table. Generate using NestJS CLI or create manually:

```bash
# Generate a new migration
npm run typeorm migration:generate -- -n CreateLeaderboardTable

# Or create manually in backend/src/migrations/
```

**SQL Migration Content**:
```sql
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  userId UUID UNIQUE NOT NULL,
  totalBets INT DEFAULT 0,
  betsWon INT DEFAULT 0,
  betsLost INT DEFAULT 0,
  totalWinnings DECIMAL(10,2) DEFAULT 0,
  bettingAccuracy DECIMAL(5,2) DEFAULT 0,
  winningStreak INT DEFAULT 0,
  highestWinningStreak INT DEFAULT 0,
  totalStaked DECIMAL(10,2) DEFAULT 0,
  totalStakingRewards DECIMAL(10,2) DEFAULT 0,
  activeStakes DECIMAL(10,2) DEFAULT 0,
  lastBetAt TIMESTAMP NULL,
  lastStakeAt TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_leaderboard_userId ON leaderboards(userId);
CREATE INDEX idx_leaderboard_totalWinnings ON leaderboards(totalWinnings);
CREATE INDEX idx_leaderboard_bettingAccuracy ON leaderboards(bettingAccuracy);
CREATE INDEX idx_leaderboard_winningStreak ON leaderboards(winningStreak);
```

### 2. **Install Dependencies**

Ensure `@nestjs/cqrs` is installed:

```bash
npm install @nestjs/cqrs
# or
pnpm add @nestjs/cqrs
```

### 3. **Testing Strategy**

#### Unit Tests
Create tests for:
- `LeaderboardService` methods
- Event handlers
- Leaderboard entity calculations

Example test file to create:
```
backend/src/leaderboard/leaderboard.service.spec.ts
backend/src/leaderboard/listeners/__tests__/
```

#### Integration Tests
Test complete workflows:
- User places bet → BetPlacedEvent → Leaderboard updated
- Match settles → BetSettledEvent → Accuracy recalculated → Streak updated
- Staking flow → Events → Stats updated

#### E2E Tests
Test API endpoints:
```bash
GET /leaderboards/users/user-id-123
GET /leaderboards/top?limit=10&orderBy=totalWinnings
```

### 4. **Validation Checklist**

- [ ] Database migration runs successfully
- [ ] Application starts without errors
- [ ] No TypeORM connection issues
- [ ] Event handlers log correctly
- [ ] BetPlacedEvent emitted and handled
- [ ] BetSettledEvent emitted and handled
- [ ] StakeCreditedEvent emitted and handled
- [ ] StakeDebitedEvent emitted and handled
- [ ] Leaderboard records created for users
- [ ] Accuracy calculated correctly (wins / total * 100)
- [ ] Winning streak increments/resets properly
- [ ] API endpoints return correct data
- [ ] Concurrent updates are atomic

### 5. **Sample Test Cases**

**Test: Winning Streak Logic**
```
1. User wins 3 consecutive bets
   → winningStreak should be 3
   → highestWinningStreak should be 3

2. User loses a bet
   → winningStreak should reset to 0
   → highestWinningStreak remains 3

3. User wins 5 more
   → winningStreak should be 5
   → highestWinningStreak should update to 5
```

**Test: Accuracy Calculation**
```
1. User places 10 bets, wins 6, loses 4
2. System should show accuracy = (6/10) * 100 = 60%
3. Accuracy NOT updated when bet is placed
4. Accuracy ONLY updated when BetSettledEvent handled
```

**Test: Atomic Operations**
```
1. Two concurrent bets settle simultaneously
2. Both leaderboard updates should complete
3. No lost updates or race conditions
4. Both bets counted in totalBets
```

### 6. **Future Enhancements**

After testing passes, consider adding:

```typescript
// Achievement system
interface Achievement {
  id: string;
  name: string;
  description: string;
  criteria: {
    minAccuracy?: number;
    minWinningStreak?: number;
    minTotalWinnings?: number;
  };
}

// Leaderboard snapshots (seasonal)
interface LeaderboardSnapshot {
  seasonId: string;
  userId: string;
  rank: number;
  stats: LeaderboardStats;
  snapshotDate: Date;
}

// Reward distribution
async distributeSeasonalRewards(season: LeaderboardSnapshot[]) {
  // Distribute prizes to top 10
}
```

### 7. **Running Tests**

```bash
# Unit tests
npm run test -- leaderboard.service

# E2E tests
npm run test:e2e -- leaderboard

# With coverage
npm run test -- --coverage leaderboard
```

## Key Implementation Details to Remember

### ✅ Accuracy is Recalculated ONLY on Settlement
- Not on bet placement
- Only when `BetSettledEvent` is handled
- Prevents premature accuracy predictions

### ✅ Winning Streak Logic
- Increments on WIN
- Resets to 0 on LOSS
- Separate tracking for highest streak

### ✅ Event Emission Timing
- Events emitted AFTER transaction commits
- Ensures consistency
- No partial updates

### ✅ Atomic Operations
- Every leaderboard update is transactional
- Pessimistic write locks prevent race conditions
- Rollback on any error

## Troubleshooting Common Issues

### Issue: "Cannot find module '@nestjs/cqrs'"
**Solution**: Install the package
```bash
npm install @nestjs/cqrs
```

### Issue: Leaderboard table not created
**Solution**: Run migration
```bash
npm run typeorm migration:run
```

### Issue: Events not being emitted
**Solution**: Verify:
1. EventBus is injected in service
2. Event is published via `this.eventBus.publish(event)`
3. Handler is registered in module
4. Transaction commits before event emit

### Issue: Accuracy not updating
**Solution**: 
1. Verify BetSettledEvent is emitted
2. Check BetSettledEventHandler is registered
3. Ensure bet settlement triggers the event
4. Check database logs for errors

## File References

For detailed information, see:

- **Implementation Guide**: [LEADERBOARD_IMPLEMENTATION.md](./LEADERBOARD_IMPLEMENTATION.md)
- **Leaderboard Service**: [backend/src/leaderboard/leaderboard.service.ts](./backend/src/leaderboard/leaderboard.service.ts)
- **Domain Events**: [backend/src/leaderboard/domain/events/](./backend/src/leaderboard/domain/events/)
- **Event Handlers**: [backend/src/leaderboard/listeners/](./backend/src/leaderboard/listeners/)
- **Updated Bets Service**: [backend/src/bets/bets.service.ts](./backend/src/bets/bets.service.ts)
- **Updated Staking Service**: [backend/src/staking/staking.service.ts](./backend/src/staking/staking.service.ts)

## Questions or Issues?

1. Check the implementation guide first
2. Review event handler logs
3. Verify database state
4. Check transaction logs
5. Ensure all modules are imported in AppModule

## Ready to Merge?

Before creating a pull request, ensure:

- ✅ All tests pass
- ✅ No TypeScript compilation errors
- ✅ Database migration works
- ✅ Application starts successfully
- ✅ Event flow works end-to-end
- ✅ Documentation is clear
- ✅ Code follows project conventions
