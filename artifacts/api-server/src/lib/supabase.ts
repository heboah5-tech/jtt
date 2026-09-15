import crypto from "crypto";
import { logger } from "./logger";

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, "");
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

// In-memory store fallback when Supabase credentials are not configured or request fails
const inMemoryStore: Record<string, any[]> = {
  visitor_tracking: [],
  payments: [],
};

export const supabase = {
  from: (table: string) => ({
    insert: async (data: any[]) => {
      const records = Array.isArray(data) ? data : [data];
      if (supabaseUrl && supabaseKey) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation"
            },
            body: JSON.stringify(records.length === 1 ? records[0] : records)
          });
          
          if (response.ok) {
            const responseData = await response.json();
            const resultData = Array.isArray(responseData) ? responseData : [responseData];
            return { data: resultData, error: null };
          }
          const errorText = await response.text();
          logger.warn({ status: response.status, errorText }, `Supabase insert failed for ${table}, using fallback`);
        } catch (e: any) {
          logger.warn({ message: e.message }, `Supabase insert error for ${table}, using fallback`);
        }
      }

      // In-memory fallback
      if (!inMemoryStore[table]) inMemoryStore[table] = [];
      const inserted = records.map((record) => {
        const item = {
          id: record.id || crypto.randomUUID(),
          created_at: new Date().toISOString(),
          ...record,
        };
        inMemoryStore[table].push(item);
        return item;
      });
      return { data: inserted, error: null };
    },

    upsert: async (data: any[]) => {
      const records = Array.isArray(data) ? data : [data];
      if (supabaseUrl && supabaseKey) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation,resolution=merge-duplicates"
            },
            body: JSON.stringify(records.length === 1 ? records[0] : records)
          });
          
          if (response.ok) {
            const responseData = await response.json();
            const resultData = Array.isArray(responseData) ? responseData : [responseData];
            return { data: resultData, error: null };
          }
          const errorText = await response.text();
          logger.warn({ status: response.status, errorText }, `Supabase upsert failed for ${table}, using fallback`);
        } catch (e: any) {
          logger.warn({ message: e.message }, `Supabase upsert error for ${table}, using fallback`);
        }
      }

      // In-memory fallback
      if (!inMemoryStore[table]) inMemoryStore[table] = [];
      const updatedList: any[] = [];
      for (const record of records) {
        const recId = record.id || crypto.randomUUID();
        const existingIdx = inMemoryStore[table].findIndex((item) => item.id === recId);
        if (existingIdx >= 0) {
          inMemoryStore[table][existingIdx] = {
            ...inMemoryStore[table][existingIdx],
            ...record,
            id: recId,
          };
          updatedList.push(inMemoryStore[table][existingIdx]);
        } else {
          const newItem = {
            id: recId,
            ...record,
          };
          inMemoryStore[table].push(newItem);
          updatedList.push(newItem);
        }
      }
      return { data: updatedList, error: null };
    },

    update: async (id: string, data: any) => {
      if (supabaseUrl && supabaseKey) {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}?id=eq.${id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation"
            },
            body: JSON.stringify(data)
          });
          
          if (response.ok) {
            const responseData = await response.json();
            const resultData = Array.isArray(responseData) ? responseData : [responseData];
            return { data: resultData, error: null };
          }
          const errorText = await response.text();
          logger.warn({ status: response.status, errorText }, `Supabase update failed for ${table}, using fallback`);
        } catch (e: any) {
          logger.warn({ message: e.message }, `Supabase update error for ${table}, using fallback`);
        }
      }

      // In-memory fallback
      if (!inMemoryStore[table]) inMemoryStore[table] = [];
      const existingIdx = inMemoryStore[table].findIndex((item) => item.id === id);
      if (existingIdx >= 0) {
        inMemoryStore[table][existingIdx] = {
          ...inMemoryStore[table][existingIdx],
          ...data,
        };
        return { data: [inMemoryStore[table][existingIdx]], error: null };
      }
      if (inMemoryStore[table].length > 0) {
        const lastIdx = inMemoryStore[table].length - 1;
        inMemoryStore[table][lastIdx] = {
          ...inMemoryStore[table][lastIdx],
          ...data,
        };
        return { data: [inMemoryStore[table][lastIdx]], error: null };
      }
      return { data: [data], error: null };
    },

    select: async (query = "*", options?: { orderBy?: string, ascending?: boolean }) => {
      if (supabaseUrl && supabaseKey) {
        try {
          const url = new URL(`${supabaseUrl}/rest/v1/${table}`);
          url.searchParams.append("select", query);
          
          if (options?.orderBy) {
            url.searchParams.append("order", `${options.orderBy}.${options.ascending ? 'asc' : 'desc'}`);
          }
          
          const response = await fetch(url.toString(), {
            method: "GET",
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
            }
          });
          
          if (response.ok) {
            const responseData = await response.json();
            return { data: responseData, error: null };
          }
          const errorText = await response.text();
          logger.warn({ status: response.status, errorText }, `Supabase select failed for ${table}, using fallback`);
        } catch (e: any) {
          logger.warn({ message: e.message }, `Supabase select error for ${table}, using fallback`);
        }
      }

      // In-memory fallback
      let list = [...(inMemoryStore[table] || [])];
      if (options?.orderBy) {
        const key = options.orderBy;
        const asc = options.ascending ?? true;
        list.sort((a, b) => {
          const valA = a[key] ?? "";
          const valB = b[key] ?? "";
          if (valA < valB) return asc ? -1 : 1;
          if (valA > valB) return asc ? 1 : -1;
          return 0;
        });
      }
      return { data: list, error: null };
    },

    delete: async (column?: string, value?: any) => {
      if (supabaseUrl && supabaseKey) {
        try {
          let urlStr = `${supabaseUrl}/rest/v1/${table}`;
          if (column && value !== undefined) {
            urlStr += `?${column}=eq.${value}`;
          } else {
            urlStr += `?id=not.is.null`;
          }
          const response = await fetch(urlStr, {
            method: "DELETE",
            headers: {
              "apikey": supabaseKey,
              "Authorization": `Bearer ${supabaseKey}`,
              "Prefer": "return=representation"
            }
          });
          
          if (response.ok) {
            const responseData = await response.json().catch(() => []);
            return { data: responseData, error: null };
          }
          const errorText = await response.text();
          logger.warn({ status: response.status, errorText }, `Supabase delete failed for ${table}, using fallback`);
        } catch (e: any) {
          logger.warn({ message: e.message }, `Supabase delete error for ${table}, using fallback`);
        }
      }

      // In-memory fallback
      if (column && value !== undefined) {
        if (inMemoryStore[table]) {
          inMemoryStore[table] = inMemoryStore[table].filter((item) => item[column] !== value);
        }
      } else {
        inMemoryStore[table] = [];
      }
      return { data: [], error: null };
    }
  })
};
