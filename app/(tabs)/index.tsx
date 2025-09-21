
import { useAuth } from '@/src/auth/AuthContext';
import { useTransactions } from '@/src/transactions/TransactionsContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const DashboardScreen = () => {
  const { user, logout } = useAuth();
  const { transactions, loading } = useTransactions();
  const router = useRouter();

  // Memoize calculations for performance
  const { totalIncome, totalExpenses, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { totalIncome: income, totalExpenses: expenses, balance: income - expenses };
  }, [transactions]);

  const screenWidth = Dimensions.get('window').width;

  const expenseByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const pieChartData = Object.keys(expenseByCategory).map((category, index) => {
    const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']; // Example colors
    const color = colors[index % colors.length];
    return {
      name: category,
      amount: expenseByCategory[category],
      color: color,
      legendFontColor: '#7F7F7F',
      legendFontSize: 15,
    };
  });

  const recentTransactions = transactions.slice(0, 3);

  const chartData = useMemo(() => {
    const labels: string[] = [];
    const data: number[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
      const dailyTotal = transactions
        .filter(t => t.date === dateString && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      data.push(dailyTotal);
    }
    return { labels, datasets: [{ data }] };
  }, [transactions]);

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
          <Text style={styles.subGreeting}>Welcome to your financial hub.</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Ionicons name="log-out-outline" size={28} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>Spending Analysis</Text>
      {pieChartData.length > 0 ? (
        <View style={styles.chartContainer}>
          <PieChart
            data={pieChartData}
            width={screenWidth - 32} // Subtract padding
            height={220}
            chartConfig={{
              backgroundColor: '#ffffff',
              backgroundGradientFrom: '#ffffff',
              backgroundGradientTo: '#ffffff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              decimalPlaces: 2,
            }}
            accessor="amount"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
          />
        </View>
      ) : (
        <Text style={styles.noDataText}>No expense data to display pie chart.</Text>
      )}


      <View style={styles.summaryContainer}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Balance</Text>
          <Text style={styles.summaryValue}>${balance.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={[styles.summaryValue, { color: '#10b981' }]}>${totalIncome.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Expense</Text>
          <Text style={[styles.summaryValue, { color: '#ef4444' }]}>${totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={() => router.push('/add-transaction')}>
        <Ionicons name="add-circle" size={22} color="white" />
        <Text style={styles.addButtonText}>Add New Transaction</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Incomes</Text>
        <BarChart
          data={chartData}
          width={width - 32} // from react-native
          height={220}
          yAxisLabel="$"
          chartConfig={{
            backgroundColor: '#ffffff',
            backgroundGradientFrom: '#ffffff',
            backgroundGradientTo: '#ffffff',
            decimalPlaces: 2,
            color: (opacity = 1) => `rgba(5, 150, 105, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(100, 116, 139, ${opacity})`,
          }}
          style={{ marginVertical: 8, borderRadius: 16 }}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {recentTransactions.length > 0 ? (
          recentTransactions.map(t => (
            <View key={t.id} style={styles.transactionItem}>
              <View>
                <Text style={styles.transactionDesc}>{t.description}</Text>
                <Text style={styles.transactionDate}>{t.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, t.type === 'income' ? styles.income : styles.expense]}>
                {t.type === 'income' ? '+' : '-'}$ {t.amount.toFixed(2)}
              </Text>
            </View>
          ))
        ) : (
          <Text>No recent transactions.</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: 'white' },
  greeting: { fontSize: 24, fontWeight: 'bold', color: '#1e293b' },
  subGreeting: { fontSize: 16, color: '#64748b' },
  summaryContainer: { flexDirection: 'row', justifyContent: 'space-around', padding: 16 },
  summaryBox: { alignItems: 'center' },
  summaryLabel: { fontSize: 14, color: '#64748b' },
  summaryValue: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
  addButton: { flexDirection: 'row', backgroundColor: '#059669', padding: 14, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginHorizontal: 16, marginVertical: 8 },
  addButtonText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  section: { backgroundColor: 'white', padding: 16, marginVertical: 8 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8, color: '#1e293b' },
  transactionItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  transactionDesc: { fontSize: 16, color: '#334155' },
  transactionDate: { fontSize: 12, color: '#94a3b8' },
  transactionAmount: { fontSize: 16, fontWeight: 'bold' },
  income: { color: '#10b981' },
  expense: { color: '#ef4444' },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
});

export default DashboardScreen;
