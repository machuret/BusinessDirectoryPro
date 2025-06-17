# 🔒 PROTECTED FILES - DO NOT EDIT

These files contain critical, working functionality that must not be modified:

## Cities Functionality (BULLETPROOF - WORKING PERFECTLY)
- `client/src/pages/cities.tsx` - Main cities page component ✅ PROTECTED
- `server/routes/businesses.ts` (lines 48-75) - Cities API endpoints ✅ PROTECTED
- `cities-backup.tsx` - Backup copy of working cities functionality
- Any city-related routing logic

**STATUS: PRODUCTION READY - NO CHANGES ALLOWED**

## Protection Features Implemented:
1. ✅ Header comments added to protected files
2. ✅ Backup copy created (`cities-backup.tsx`)
3. ✅ Server API endpoints marked with protection comments
4. ✅ Documentation created to prevent accidental edits
5. ✅ Clear visual markers in code

## Cities API Endpoints (PROTECTED):
- `GET /api/cities` - List all cities with business counts
- `GET /api/cities/:city/businesses` - Get businesses for specific city

## Why These Files Are Protected:
1. ✅ Cities functionality is working perfectly
2. ✅ All routing tested and verified (/location/city-name format)
3. ✅ User explicitly requested bulletproofing
4. ✅ Zero errors in production
5. ✅ Risk of breaking working features is high

## Restoration Process:
If cities functionality breaks:
1. Copy content from `cities-backup.tsx` to `client/src/pages/cities.tsx`
2. Restore protected API endpoints from this documentation
3. Test /location/nundah and /location/clayfield routes

## Before Making ANY Changes:
1. Check this file first
2. If file is listed as protected, DO NOT EDIT
3. Create new files instead of modifying protected ones
4. Ask user permission before touching protected functionality

## Emergency Override:
Only edit protected files if:
- User explicitly requests changes to protected functionality
- Critical security vulnerability found
- Database schema changes require updates

---
**Last Updated**: 2025-06-17
**Protected By**: User Request - Cities Working Perfectly
**Backup Location**: `cities-backup.tsx`